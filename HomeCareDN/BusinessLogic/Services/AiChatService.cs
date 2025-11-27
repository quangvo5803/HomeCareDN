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
        private const string COOKIE_NAME = "HC_SUPPORT_CHAT_V1";
        private const string CATALOG_CACHE_KEY = "HC_AI_CATALOG_V1";
        private const int HISTORY_DAYS = 3;
        private const int CATALOG_CACHE_HOURS = 1;
        private const int MAX_HISTORY_MESSAGES = 20;
        private const int MAX_RELEVANT_ITEMS = 15;
        private const int MAX_GENERAL_ITEMS = 10;
        private const int MAX_KEYWORDS = 10;

        private readonly IDistributedCache _cache;
        private readonly IGroqClient _groq;
        private readonly IHttpContextAccessor _http;
        private readonly IUnitOfWork _unitOfWork;

        private static readonly DistributedCacheEntryOptions HistoryCacheOptions = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(HISTORY_DAYS),
        };

        private static readonly DistributedCacheEntryOptions CatalogCacheOptions = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(CATALOG_CACHE_HOURS),
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

        // ===== PUBLIC API =====
        public async Task<AiChatResponseDto> SendAsync(AiChatRequestDto request)
        {
            var sessionId = EnsureCookieId();
            var history = (await GetHistoryAsync(sessionId)).ToList();
            var context = await BuildDynamicContextAsync(request.Prompt);

            var messages = BuildMessagePayload(history, request.Prompt, context);
            var reply = await _groq.ChatAsync(
                new
                {
                    model = "llama-3.3-70b-versatile",
                    messages,
                    temperature = 0.3,
                    max_tokens = 1024,
                }
            );

            await SaveMessageToHistoryAsync(sessionId, history, request.Prompt, reply);

            return new AiChatResponseDto
            {
                Reply = reply,
                History = history.TakeLast(MAX_HISTORY_MESSAGES).ToList(),
            };
        }

        public async Task<IEnumerable<AiChatMessageDto>> GetHistoryAsync()
        {
            var sessionId = ReadCookieId();
            return sessionId == null
                ? Enumerable.Empty<AiChatMessageDto>()
                : await GetHistoryAsync(sessionId);
        }

        public async Task ClearHistoryAsync()
        {
            var sessionId = ReadCookieId();
            if (sessionId != null)
            {
                await _cache.RemoveAsync(HistoryCacheKey(sessionId));
            }
            _http.HttpContext!.Response.Cookies.Delete(COOKIE_NAME);
        }

        // ===== PRIVATE: MESSAGE BUILDING =====
        private List<object> BuildMessagePayload(
            List<AiChatMessageDto> history,
            string userPrompt,
            string context
        )
        {
            var messages = new List<object>
            {
                new { role = "system", content = BuildSystemPrompt(context) },
            };

            // Add last N messages from history
            foreach (var msg in history.TakeLast(MAX_HISTORY_MESSAGES))
            {
                messages.Add(new { role = msg.Role, content = msg.Content });
            }

            messages.Add(new { role = "user", content = userPrompt });
            return messages;
        }

        private async Task SaveMessageToHistoryAsync(
            string sessionId,
            List<AiChatMessageDto> history,
            string userPrompt,
            string aiReply
        )
        {
            history.Add(
                new AiChatMessageDto
                {
                    Role = "user",
                    Content = userPrompt,
                    TimestampUtc = DateTime.UtcNow,
                }
            );

            history.Add(
                new AiChatMessageDto
                {
                    Role = "assistant",
                    Content = aiReply,
                    TimestampUtc = DateTime.UtcNow,
                }
            );

            await SaveHistoryAsync(sessionId, history);
        }

        // ===== PRIVATE: CONTEXT BUILDING =====
        private async Task<string> BuildDynamicContextAsync(string userPrompt)
        {
            var keywords = ExtractKeywords(userPrompt);
            var sb = new StringBuilder();

            // Check if user asking for instructions
            if (IsAskingForInstructions(keywords))
            {
                sb.AppendLine("=== QUY TRÌNH BẮT BUỘC TẠO YÊU CẦU ===");
                sb.AppendLine("1. Vào Profile → Cập nhật Họ tên, SĐT, Địa chỉ");
                sb.AppendLine("2. Không được tạo yêu cầu nếu thiếu thông tin");
                sb.AppendLine("=======================================\n");
            }

            // Get and filter catalog items
            var allItems = await GetCachedCatalogAsync();
            var relevantItems = FilterRelevantItems(allItems, keywords);

            if (!relevantItems.Any())
            {
                sb.AppendLine(
                    "[NOTE] Không tìm thấy kết quả chính xác. Hiển thị danh sách chung.\n"
                );
                relevantItems = allItems.Take(MAX_GENERAL_ITEMS).ToList();
            }

            AppendCatalogToContext(sb, relevantItems);

            return sb.Length == 0 ? "Không có dữ liệu." : sb.ToString();
        }

        private void AppendCatalogToContext(StringBuilder sb, List<CatalogItem> items)
        {
            var services = items.Where(x => x.Type == "Service").ToList();
            if (services.Any())
            {
                sb.AppendLine("=== DỊCH VỤ KHẢ DỤNG (CHỈ SỬ DỤNG ID NÀY) ===");
                foreach (var s in services)
                    sb.AppendLine($"- {s.DisplayString}");
                sb.AppendLine();
            }

            var materials = items.Where(x => x.Type == "Material").ToList();
            if (materials.Any())
            {
                sb.AppendLine("=== VẬT LIỆU KHẢ DỤNG (CHỈ SỬ DỤNG ID NÀY) ===");
                foreach (var m in materials)
                    sb.AppendLine($"- {m.DisplayString}");
                sb.AppendLine();
            }
        }

        private List<CatalogItem> FilterRelevantItems(
            List<CatalogItem> allItems,
            List<string> keywords
        )
        {
            return allItems
                .Where(item =>
                    keywords.Any(k => item.Name.Contains(k, StringComparison.OrdinalIgnoreCase))
                )
                .Take(MAX_RELEVANT_ITEMS)
                .ToList();
        }

        private bool IsAskingForInstructions(List<string> keywords)
        {
            var instructionKeywords = new[]
            {
                "tạo",
                "đặt",
                "mua",
                "yêu",
                "cầu",
                "create",
                "order",
                "request",
                "buy",
            };

            return keywords.Any(k =>
                instructionKeywords.Any(ik => k.Contains(ik, StringComparison.OrdinalIgnoreCase))
            );
        }

        private List<string> ExtractKeywords(string prompt)
        {
            if (string.IsNullOrWhiteSpace(prompt))
                return new List<string>();

            var cleaned = Regex.Replace(
                prompt,
                @"[^\w\sđàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]",
                " "
            );

            return cleaned
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Where(w => w.Length > 1)
                .Distinct()
                .Take(MAX_KEYWORDS)
                .ToList();
        }

        // ===== PRIVATE: CATALOG CACHING =====
        private async Task<List<CatalogItem>> GetCachedCatalogAsync()
        {
            var cached = await _cache.GetStringAsync(CATALOG_CACHE_KEY);
            if (!string.IsNullOrEmpty(cached))
            {
                return JsonSerializer.Deserialize<List<CatalogItem>>(cached) ?? new();
            }

            var items = await BuildCatalogFromDatabaseAsync();
            await _cache.SetStringAsync(
                CATALOG_CACHE_KEY,
                JsonSerializer.Serialize(items),
                CatalogCacheOptions
            );

            return items;
        }

        private async Task<List<CatalogItem>> BuildCatalogFromDatabaseAsync()
        {
            var items = new List<CatalogItem>();

            var services = await _unitOfWork.ServiceRepository.GetAllAsync();
            items.AddRange(
                services.Select(s => new CatalogItem
                {
                    Id = s.ServiceID,
                    Name = s.Name,
                    Type = "Service",
                    DisplayString = $"ID: {s.ServiceID} | Name: {s.Name}",
                })
            );

            var materials = await _unitOfWork.MaterialRepository.GetAllAsync();
            items.AddRange(
                materials.Select(m => new CatalogItem
                {
                    Id = m.MaterialID,
                    Name = m.Name,
                    Type = "Material",
                    DisplayString = $"ID: {m.MaterialID} | Name: {m.Name}",
                })
            );

            return items;
        }

        // ===== PRIVATE: SYSTEM PROMPT =====
        private string BuildSystemPrompt(string catalogContext)
        {
            return $@"
                You are HomeCareDN Virtual Assistant.
                Assist customers in Vietnamese (default) or English based on input.

                [STRICT RULES]:
                1. SECURITY: NEVER reveal personal user data
                2. CONTEXT: Use [CATALOG DATA] below to answer
                   - IF ITEM NOT IN LIST → DO NOT CREATE LINK
                   - NO FAKE IDs (like '123', '1', 'example')
                   - ONLY use real UUIDs from catalog

                3. FORMATTING:
                   - Use Markdown links: [Text](URL)
                   - Service: [Name](/ServiceDetail/{{UUID}})
                   - Material: [Name](/MaterialDetail/{{UUID}})

                4. NO DATA CASE:
                   - If no exact match → recommend similar items with REAL UUIDs
                   - If absolutely no data → give text advice WITHOUT links

                [CATALOG DATA]:
                {catalogContext}
                ";
        }

        // ===== PRIVATE: COOKIE & CACHE =====
        private string EnsureCookieId()
        {
            var existing = ReadCookieId();
            if (!string.IsNullOrWhiteSpace(existing))
                return existing!;

            var newId = Guid.NewGuid().ToString("N");
            _http.HttpContext!.Response.Cookies.Append(
                COOKIE_NAME,
                newId,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddDays(HISTORY_DAYS),
                    Path = "/",
                }
            );

            return newId;
        }

        private string? ReadCookieId()
        {
            return
                _http.HttpContext?.Request.Cookies.TryGetValue(COOKIE_NAME, out var value) == true
                ? value
                : null;
        }

        private async Task<IEnumerable<AiChatMessageDto>> GetHistoryAsync(string sessionId)
        {
            var json = await _cache.GetStringAsync(HistoryCacheKey(sessionId));
            return string.IsNullOrEmpty(json)
                ? new List<AiChatMessageDto>()
                : JsonSerializer.Deserialize<List<AiChatMessageDto>>(json) ?? new();
        }

        private Task SaveHistoryAsync(string sessionId, IEnumerable<AiChatMessageDto> messages)
        {
            var json = JsonSerializer.Serialize(messages);
            return _cache.SetStringAsync(HistoryCacheKey(sessionId), json, HistoryCacheOptions);
        }

        private static string HistoryCacheKey(string id) => $"HC_ChatHistory:{id}";

        // ===== PRIVATE: MODELS =====
        private class CatalogItem
        {
            public Guid Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty;
            public string DisplayString { get; set; } = string.Empty;
        }
    }
}
