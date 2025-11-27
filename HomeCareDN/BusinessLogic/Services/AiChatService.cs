using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using BusinessLogic.DTOs.Application.Chat.Ai;
using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Ultitity.Clients.Groqs;

namespace BusinessLogic.Services
{
    public class AiChatService : IAiChatService
    {
        private const string CookieName = "HC_SUPPORT_CHAT_V1";
        private const string RawCatalogCacheKey = "HC_AI_RAW_CATALOG_ITEMS_V1";

        private readonly IDistributedCache _cache;
        private readonly IGroqClient _groq;
        private readonly IHttpContextAccessor _http;
        private readonly IUnitOfWork _unitOfWork;

        private static readonly DistributedCacheEntryOptions HistoryCacheOpt = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(3),
        };

        private static readonly DistributedCacheEntryOptions CatalogCacheOpt = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1),
        };

        public AiChatService(
            IDistributedCache cache,
            IGroqClient groq,
            IHttpContextAccessor http,
            IUnitOfWork unitOfWork
        )
        {
            _cache = cache;
            _groq = groq;
            _http = http;
            _unitOfWork = unitOfWork;
        }

        public async Task<AiChatResponseDto> SendAsync(AiChatRequestDto request)
        {
            var sessionId = EnsureCookieId();
            var history = (await GetHistoryInternalAsync(sessionId)).ToList();
            string dynamicContext = await GetRelevantContextAsync(request.Prompt);

            var messages = new List<object>
            {
                new { role = "system", content = BuildSystemPrompt(dynamicContext) },
            };

            foreach (var msg in history.TakeLast(20))
            {
                messages.Add(new { role = msg.Role, content = msg.Content });
            }

            messages.Add(new { role = "user", content = request.Prompt });

            var payload = new
            {
                model = "llama-3.3-70b-versatile",
                messages,
                temperature = 0.3,
                max_tokens = 1024,
            };

            string reply = await _groq.ChatAsync(payload);

            history.Add(
                new AiChatMessageDto
                {
                    Role = "user",
                    Content = request.Prompt,
                    TimestampUtc = DateTime.UtcNow,
                }
            );
            history.Add(
                new AiChatMessageDto
                {
                    Role = "assistant",
                    Content = reply,
                    TimestampUtc = DateTime.UtcNow,
                }
            );

            await SaveHistoryInternalAsync(sessionId, history);

            return new AiChatResponseDto { Reply = reply, History = history.TakeLast(20).ToList() };
        }

        private async Task<string> GetRelevantContextAsync(string userPrompt)
        {
            var keywords = ExtractKeywords(userPrompt);
            var sb = new StringBuilder();

            bool isAskingForInstruction = keywords.Any(k =>
                k.Contains("tạo")
                || k.Contains("đặt")
                || k.Contains("mua")
                || k.Contains("yêu")
                || k.Contains("cầu")
                || k.Contains("create")
                || k.Contains("order")
                || k.Contains("request")
                || k.Contains("buy")
            );

            if (isAskingForInstruction)
            {
                sb.AppendLine("=== SYSTEM INSTRUCTIONS (QUY TRÌNH HỆ THỐNG) ===");
                sb.AppendLine("Quy tắc BẮT BUỘC để tạo Yêu cầu/Đặt hàng:");
                sb.AppendLine("1. Vào Profile -> Cập nhật Họ tên, SĐT, Địa chỉ.");
                sb.AppendLine("2. Hệ thống không cho phép tạo yêu cầu nếu thiếu thông tin.");
                sb.AppendLine("================================================");
            }

            var allItems = await GetCachedCatalogItemsAsync();

            var relevantItems = allItems
                .Where(item =>
                    keywords.Any(k => item.Name.Contains(k, StringComparison.OrdinalIgnoreCase))
                )
                .Take(15)
                .ToList();

            if (!relevantItems.Any())
            {
                sb.AppendLine(
                    "\n[NOTE]: No exact match found for keywords. Displaying GENERAL LIST."
                );
                relevantItems = allItems.Take(10).ToList();
            }

            if (relevantItems.Any())
            {
                var services = relevantItems.Where(x => x.Type == "Service").ToList();
                if (services.Any())
                {
                    sb.AppendLine("\n=== AVAILABLE SERVICES (USE THESE IDs ONLY) ===");
                    foreach (var s in services)
                        sb.AppendLine($"- {s.DisplayString}");
                }

                var materials = relevantItems.Where(x => x.Type == "Material").ToList();
                if (materials.Any())
                {
                    sb.AppendLine("\n=== AVAILABLE MATERIALS (USE THESE IDs ONLY) ===");
                    foreach (var m in materials)
                        sb.AppendLine($"- {m.DisplayString}");
                }
            }

            var result = sb.ToString();
            return string.IsNullOrWhiteSpace(result) ? "No data available." : result;
        }

        private List<string> ExtractKeywords(string prompt)
        {
            if (string.IsNullOrWhiteSpace(prompt))
                return new List<string>();
            var clean = Regex.Replace(
                prompt,
                @"[^\w\sđàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]",
                " "
            );
            return clean
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Where(w => w.Length > 1)
                .Distinct()
                .Take(10)
                .ToList();
        }

        private async Task<List<CatalogItemLite>> GetCachedCatalogItemsAsync()
        {
            var cachedJson = await _cache.GetStringAsync(RawCatalogCacheKey);
            if (!string.IsNullOrEmpty(cachedJson))
            {
                return JsonSerializer.Deserialize<List<CatalogItemLite>>(cachedJson) ?? new();
            }

            var items = new List<CatalogItemLite>();

            var services = await _unitOfWork.ServiceRepository.GetAllAsync();
            items.AddRange(
                services.Select(s => new CatalogItemLite
                {
                    Id = s.ServiceID,
                    Name = s.Name,
                    Type = "Service",
                    DisplayString = $"ID: {s.ServiceID} | Name: {s.Name}",
                })
            );

            var materials = await _unitOfWork.MaterialRepository.GetAllAsync();
            items.AddRange(
                materials.Select(m => new CatalogItemLite
                {
                    Id = m.MaterialID,
                    Name = m.Name,
                    Type = "Material",
                    DisplayString = $"ID: {m.MaterialID} | Name: {m.Name}",
                })
            );

            await _cache.SetStringAsync(
                RawCatalogCacheKey,
                JsonSerializer.Serialize(items),
                CatalogCacheOpt
            );
            return items;
        }

        private class CatalogItemLite
        {
            public Guid Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty;
            public string DisplayString { get; set; } = string.Empty;
        }

        private string BuildSystemPrompt(string catalogContext)
        {
            return $@"
                    You are the Virtual Assistant of HomeCareDN.
                    Your goal is to assist customers in Vietnamese (default) or English base on input.

                    [STRICT RULES]:
                    1. SECURITY: NEVER reveal personal user data.
                    2. CONTEXT: Use [RELEVANT CATALOG DATA] below to answer.
                       - IF THE ITEM IS NOT IN THE LIST, DO NOT CREATE A LINK.
                       - NO FAKE IDs (like '123', '1', 'example'). ONLY use UUIDs provided in the catalog.
   
                    3. FORMATTING:
                       - Use standard Markdown links: [Link Text](URL).
                       - Link Pattern:
                         + Service: [Name](/ServiceDetail/{{UUID}})
                         + Material: [Name](/MaterialDetail/{{UUID}})
   
                    4. NO DATA CASE:
                       - If [RELEVANT CATALOG DATA] does not contain the specific service user asked (e.g. 'Build Grade 4 House'), 
                         you can recommend generic services from the list (e.g. 'General Construction') BUT use the REAL UUID from the list.
                       - If absolutely no relevant data exists, just give text advice WITHOUT links.

                    [RELEVANT CATALOG DATA]:
                    {catalogContext}
                    ";
        }

        // --- PRIVATE HELPER (Giữ nguyên) ---
        private string EnsureCookieId()
        {
            var existing = ReadCookieId();
            if (!string.IsNullOrWhiteSpace(existing))
                return existing!;
            var id = Guid.NewGuid().ToString("N");
            _http.HttpContext!.Response.Cookies.Append(
                CookieName,
                id,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddDays(3),
                    Path = "/",
                }
            );
            return id;
        }

        private string? ReadCookieId()
        {
            var ctx = _http.HttpContext;
            return ctx?.Request.Cookies.TryGetValue(CookieName, out var v) == true ? v : null;
        }

        public async Task<IEnumerable<AiChatMessageDto>> GetHistoryAsync()
        {
            var id = ReadCookieId();
            if (id is null)
                return Enumerable.Empty<AiChatMessageDto>();
            return await GetHistoryInternalAsync(id);
        }

        private async Task<IEnumerable<AiChatMessageDto>> GetHistoryInternalAsync(string id)
        {
            var raw = await _cache.GetStringAsync(CacheKey(id));
            return string.IsNullOrEmpty(raw)
                ? new List<AiChatMessageDto>()
                : JsonSerializer.Deserialize<List<AiChatMessageDto>>(raw) ?? new();
        }

        private Task SaveHistoryInternalAsync(string id, IEnumerable<AiChatMessageDto> list)
        {
            var json = JsonSerializer.Serialize(list);
            return _cache.SetStringAsync(CacheKey(id), json, HistoryCacheOpt);
        }

        public async Task ClearHistoryAsync()
        {
            var id = ReadCookieId();
            if (id != null)
                await _cache.RemoveAsync(CacheKey(id));
            _http.HttpContext!.Response.Cookies.Delete(CookieName);
        }

        private static string CacheKey(string id) => $"Groq_Chat_Cookie_Id:{id}";
    }
}
