using System.Text.Json;
using BusinessLogic.DTOs.Application.Chat.Ai;
using BusinessLogic.Services.Interfaces;
using Ultitity.Clients.Groqs;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class AiChatService : IAiChatService
    {
        private readonly IGroqClient _groq;
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

        public AiChatService(IGroqClient groq)
        {
            _groq = groq;
        }

        public async Task<AiChatResponseDto> ChatSupportAsync(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                var error = new Dictionary<string, string[]>
                {
                    { MESSAGE, new[] { ERROR_EMPTY_MESSAGE } },
                };
                throw new CustomValidationException(error);
            }

            var result = await _groq.ChatAsync(SYSTEM_PROMPT_CHAT, message);

            var history = new List<AiChatMessageDto>
            {
                new AiChatMessageDto
                {
                    Role = "user",
                    Content = message,
                    TimestampUtc = DateTime.UtcNow,
                },
                new AiChatMessageDto
                {
                    Role = "assistant",
                    Content = result,
                    TimestampUtc = DateTime.UtcNow,
                },
            };
            return new AiChatResponseDto { Reply = result, History = history };
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

            var result = await _groq.ChatAsync(SYSTEM_PROMPT_SUGGEST, query);

            return ExtractJsonList(result, query);
        }

        public async Task<string> EstimatePriceAsync(AiEstimateRequestDto dto)
        {
            var context =
                dto.Data != null
                    ? JsonSerializer.Serialize(dto.Data)
                    : "Không có thông số chi tiết";
            var result = string.Format(SYSTEM_PROMPT_ESTIMATE, context);

            return await _groq.ChatAsync(result, dto.Requirement);
        }

        // -----------------------------
        // PRIVATE HELPER
        // -----------------------------
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
    }
}
