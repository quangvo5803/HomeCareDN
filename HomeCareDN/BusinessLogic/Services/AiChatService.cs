using System.Text.Json;
using System.Text.Json.Serialization;
using BusinessLogic.DTOs.Application.Chat.Ai;
using BusinessLogic.Services.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Ultitity.Clients.Groqs;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class AiChatService : IAiChatService
    {
        private readonly IGroqClient _groq;
        private readonly IDistributedCache _cache;

        private const string MESSAGE = "Message";
        private const string ERROR_EMPTY_MESSAGE = "EMPTY_MESSAGE";

        private const string SYSTEM_PROMPT_CHAT =
            @"Bạn là Trợ lý ảo HomeCareDN (Tiếng Việt). 
              Nhiệm vụ: Hỗ trợ khách hàng tìm thợ, vật tư, giải đáp thắc mắc. 
              Yêu cầu: Trả lời ngắn gọn, lịch sự, dùng Markdown để trình bày đẹp.";

        private const string SYSTEM_PROMPT_SUGGEST =
            @"Bạn là API gợi ý từ khóa (Autocomplete). 
              Nhiệm vụ: Dựa vào input của user, hãy đoán và trả về 5 từ khóa liên quan nhất trong lĩnh vực xây dựng/sửa chữa nhà.
              BẮT BUỘC: Chỉ trả về mảng JSON thuần túy (Array String). Không Markdown, không giải thích.
              Ví dụ: [""sửa điện"", ""thợ điện"", ""bóng đèn""]";

        private const string SYSTEM_PROMPT_ESTIMATE =
            @"Bạn là Chuyên gia Dự toán Xây dựng HomeCareDN.
              Context: {0}
              Nhiệm vụ: Ước lượng chi phí sơ bộ dựa trên yêu cầu.
              Yêu cầu: Trình bày bảng giá (Table Markdown), các hạng mục cần làm, và tổng chi phí ước tính (VNĐ).
              Cảnh báo: Ghi rõ đây chỉ là tham khảo.";

        public AiChatService(IGroqClient groq, IDistributedCache cache)
        {
            _groq = groq;
            _cache = cache;
        }

        public async Task<AiChatResponseDto> ChatSupportAsync(AiChatRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Prompt))
            {
                var error = new Dictionary<string, string[]>
                {
                    { MESSAGE, new[] { ERROR_EMPTY_MESSAGE } },
                };
                throw new CustomValidationException(error);
            }

            var history = await GetHistoryFromCacheAsync(dto.SessionId);

            history.Add(new ChatHistoryItem { Role = "user", Content = dto.Prompt });

            var result = await _groq.ChatAsync(history);

            if (!string.IsNullOrEmpty(result))
            {
                history.Add(new ChatHistoryItem { Role = "assistant", Content = result });
                await SaveHistoryToCacheAsync(dto.SessionId, history);
            }

            return new AiChatResponseDto { Reply = result };
        }

        public async Task<List<string>> SuggestSearchAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                var error = new Dictionary<string, string[]>
                {
                    { MESSAGE, new[] { ERROR_EMPTY_MESSAGE } },
                };
                throw new CustomValidationException(error);
            }

            var messages = new List<object>
            {
                new { role = "system", content = SYSTEM_PROMPT_SUGGEST },
                new { role = "user", content = query },
            };

            var result = await _groq.ChatAsync(messages);

            return ExtractJsonList(result, query);
        }

        public async Task<string> EstimatePriceAsync(AiEstimateRequestDto dto)
        {
            var context =
                dto.Data != null
                    ? JsonSerializer.Serialize(dto.Data)
                    : "Không có thông số chi tiết";
            var systemPrompt = string.Format(SYSTEM_PROMPT_ESTIMATE, context);
            var messages = new List<object>
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = dto.Requirement },
            };

            return await _groq.ChatAsync(messages);
        }

        // -----------------------------
        // PRIVATE HELPER
        // -----------------------------
        private async Task<List<ChatHistoryItem>> GetHistoryFromCacheAsync(string sessionId)
        {
            var key = $"chat_history_{sessionId}";

            try
            {
                var json = await _cache.GetStringAsync(key);
                if (string.IsNullOrEmpty(json))
                {
                    return new List<ChatHistoryItem>
                    {
                        new ChatHistoryItem { Role = "system", Content = SYSTEM_PROMPT_CHAT },
                    };
                }
                return JsonSerializer.Deserialize<List<ChatHistoryItem>>(json)
                    ?? new List<ChatHistoryItem>();
            }
            catch
            {
                return new List<ChatHistoryItem>
                {
                    new ChatHistoryItem { Role = "system", Content = SYSTEM_PROMPT_CHAT },
                };
            }
        }

        private async Task SaveHistoryToCacheAsync(string sessionId, List<ChatHistoryItem> history)
        {
            try
            {
                var key = $"chat_history_{sessionId}";
                var options = new DistributedCacheEntryOptions
                {
                    SlidingExpiration = TimeSpan.FromDays(3),
                };

                var result = JsonSerializer.Serialize(history);
                await _cache.SetStringAsync(key, result, options);
            }
            catch
            {
                // Ignore cache save errors
            }
        }

        private static List<string> ExtractJsonList(string aiResponse, string originalQuery)
        {
            try
            {
                int startIndex = aiResponse.IndexOf('[');
                int endIndex = aiResponse.LastIndexOf(']');

                if (startIndex != -1 && endIndex != -1 && endIndex > startIndex)
                {
                    string jsonPart = aiResponse.Substring(startIndex, endIndex - startIndex + 1);
                    var result = JsonSerializer.Deserialize<List<string>>(jsonPart);
                    return result ?? new List<string> { originalQuery };
                }

                return new List<string> { originalQuery };
            }
            catch
            {
                return new List<string> { originalQuery };
            }
        }

        // -----------------------------
        // PRIVATE CLASS HELPER
        // -----------------------------
        private class ChatHistoryItem
        {
            [JsonPropertyName("role")]
            public string Role { get; set; } = "";

            [JsonPropertyName("content")]
            public string Content { get; set; } = "";
        }
    }
}
