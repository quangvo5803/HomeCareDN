using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using BusinessLogic.DTOs.Application.Chat.Ai;
using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;
using Microsoft.Extensions.Caching.Distributed;
using Ultitity.Clients.Groqs;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class AiChatService : IAiChatService
    {
        private readonly IGroqClient _groq;
        private readonly IDistributedCache _cache;
        private readonly IUnitOfWork _unitOfWork;

        private const string MESSAGE = "Message";
        private const string ERROR_EMPTY_MESSAGE = "EMPTY_MESSAGE";

        private const string SYSTEM_PROMPT_CHAT =
            @"Bạn là Trợ lý ảo HomeCareDN (Tiếng Việt).
              
              NHIỆM VỤ:
              1. Hỗ trợ tìm kiếm vật liệu, dịch vụ.
              2. Dựa vào [DỮ LIỆU HỆ THỐNG] bên dưới để trả lời.

              QUY TẮC GẮN LINK (BẮT BUỘC):
              - Hãy nhìn vào phần [DỮ LIỆU HỆ THỐNG].
              - Nếu thấy dòng bắt đầu bằng 'LINK:', hãy copy nguyên văn dòng đó để gửi cho khách.
              - Ví dụ: Nếu dữ liệu có 'LINK: [Gạch A](/path/123)', bạn hãy trả lời: 'Bạn có thể tham khảo [Gạch A](/path/123)'.
              - NẾU KHÔNG CÓ DÒNG 'LINK:' NÀO -> TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ BỊA LINK.

              QUY TẮC TRẢ LỜI:
              - Nếu [DỮ LIỆU HỆ THỐNG] có sản phẩm khớp nhu cầu -> Giới thiệu và gắn link.
              - Nếu [DỮ LIỆU HỆ THỐNG] trả về sản phẩm KHÔNG khớp (Gợi ý khác) -> Bạn nói: 'Hiện tại chưa có đúng loại bạn tìm, nhưng bên mình có các loại này...' (Gắn link các loại đó).
              - Nếu hoàn toàn không có gì -> Hướng dẫn tạo 'Yêu cầu' (Request).
              
              QUY TẮC TẠO YÊU CẦU:
              - Kiểm tra [USER PROFILE]. Nếu 'HasAddress' = false -> Nhắc cập nhật địa chỉ tại [Hồ sơ](/Customer).
              - Chỉ hướng dẫn tạo yêu cầu khi không tìm thấy sản phẩm ưng ý.";

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

        public AiChatService(IGroqClient groq, IDistributedCache cache, IUnitOfWork unitOfWork)
        {
            _groq = groq;
            _cache = cache;
            _unitOfWork = unitOfWork;
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
            string internalContext = await BuildInternalContextAsync(dto.Prompt);

            var history = await GetHistoryFromCacheAsync(dto.SessionId);

            history.RemoveAll(x => x.Role == "system");

            var dynamicSystemPrompt =
                $"{SYSTEM_PROMPT_CHAT}\n\n[DỮ LIỆU HỆ THỐNG HIỆN TẠI]:\n{internalContext}";

            history.Insert(
                0,
                new ChatHistoryItem { Role = "system", Content = dynamicSystemPrompt }
            );

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
            var result = await _groq.ChatAsync(SYSTEM_PROMPT_SUGGEST, query);
            return ExtractJsonList(result, query);
        }

        public async Task<string> EstimatePriceAsync(AiEstimateRequestDto dto)
        {
            var context =
                dto.Data != null
                    ? JsonSerializer.Serialize(dto.Data)
                    : "Không có thông số chi tiết";
            var systemPrompt = string.Format(SYSTEM_PROMPT_ESTIMATE, context);

            return await _groq.ChatAsync(systemPrompt, dto.Requirement);
        }

        // -----------------------------
        // PRIVATE HELPER
        // -----------------------------
        private async Task<string> BuildInternalContextAsync(string userPrompt)
        {
            var sb = new StringBuilder();

            List<string> keywords = new List<string>();
            try
            {
                var extractResult = await _groq.ChatAsync(SYSTEM_PROMPT_SUGGEST, userPrompt);
                keywords = ExtractJsonList(extractResult, userPrompt);
            }
            catch
            {
                keywords.Add(userPrompt);
            }

            try
            {
                var allMaterials = await _unitOfWork.MaterialRepository.GetAllAsync();

                var foundMaterials = allMaterials
                    .Where(m =>
                        keywords.Any(k => m.Name.Contains(k, StringComparison.OrdinalIgnoreCase))
                    )
                    .Take(5)
                    .ToList();

                if (!foundMaterials.Any())
                {
                    foundMaterials = allMaterials.Take(5).ToList();
                }

                if (foundMaterials.Any())
                {
                    sb.AppendLine("--- DANH SÁCH VẬT LIỆU CÓ SẴN TRONG HỆ THỐNG ---");
                    foreach (var m in foundMaterials)
                    {
                        sb.AppendLine($"LINK: [{m.Name}](/MaterialDetail/{m.MaterialID})");
                    }
                }
            }
            catch { }

            try
            {
                var allServices = await _unitOfWork.ServiceRepository.GetAllAsync();

                var foundServices = allServices
                    .Where(s =>
                        keywords.Any(k => s.Name.Contains(k, StringComparison.OrdinalIgnoreCase))
                    )
                    .Take(5)
                    .ToList();

                if (!foundServices.Any())
                {
                    foundServices = allServices.Take(5).ToList();
                }

                if (foundServices.Any())
                {
                    sb.AppendLine("--- DANH SÁCH DỊCH VỤ CÓ SẴN TRONG HỆ THỐNG ---");
                    foreach (var s in foundServices)
                    {
                        sb.AppendLine($"LINK: [{s.Name}](/ServiceDetail/{s.ServiceID})");
                    }
                }
            }
            catch { }
            if (sb.Length == 0)
            {
                sb.AppendLine(
                    "HỆ THỐNG: Hiện tại kho dữ liệu đang trống. Hãy hướng dẫn khách tạo yêu cầu."
                );
            }

            return sb.ToString();
        }

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
