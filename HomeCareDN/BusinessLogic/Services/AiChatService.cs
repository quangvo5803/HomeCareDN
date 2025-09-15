using System.Text.Json;
using BusinessLogic.DTOs.Application.Chat.Ai;
using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Ultitity.Clients.Groqs;

namespace BusinessLogic.Services
{
    public class AiChatService : IAiChatService
    {
        private const string CookieName = "HC_SUPPORT_CHAT_V1";
        private readonly IDistributedCache _cache;
        private readonly IGroqClient _groq;
        private readonly IHttpContextAccessor _http;

        private static readonly DistributedCacheEntryOptions CacheOpt = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(3), //Chỉnh sửa số thời gian muốn lưu session
        };

        public AiChatService(IDistributedCache cache, IGroqClient groq, IHttpContextAccessor http)
        {
            _cache = cache;
            _groq = groq;
            _http = http;
        }

        public async Task<AiChatResponseDto> SendAsync(AiChatRequestDto request)
        {
            var id = EnsureCookieId();
            var history = (await GetHistoryInternalAsync(id)).ToList();

            // giữ tối đa 20 message gần nhất để tiết kiệm token
            var shortHistory = history.TakeLast(20).ToList();

            shortHistory.Add(
                new AiChatMessageDto
                {
                    Role = "user",
                    Content = request.Prompt,
                    TimestampUtc = DateTime.UtcNow,
                }
            );

            var reply = await _groq.ChatAsync(shortHistory.Select(m => (m.Role, m.Content)));
            shortHistory.Add(
                new AiChatMessageDto
                {
                    Role = "assistant",
                    Content = reply,
                    TimestampUtc = DateTime.UtcNow,
                }
            );

            await SaveHistoryInternalAsync(id, shortHistory);

            return new AiChatResponseDto { Reply = reply, History = shortHistory };
        }

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
            if (ctx == null)
                return null;
            return
                ctx.Request.Cookies.TryGetValue(CookieName, out var v)
                && !string.IsNullOrWhiteSpace(v)
                ? v
                : null;
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
            if (string.IsNullOrEmpty(raw))
                return Enumerable.Empty<AiChatMessageDto>();
            return JsonSerializer.Deserialize<List<AiChatMessageDto>>(raw) ?? new();
        }

        private Task SaveHistoryInternalAsync(string id, IEnumerable<AiChatMessageDto> list)
        {
            var json = JsonSerializer.Serialize(list);
            return _cache.SetStringAsync(CacheKey(id), json, CacheOpt);
        }

        public async Task ClearHistoryAsync()
        {
            var id = ReadCookieId();
            if (id is not null)
            {
                await _cache.RemoveAsync(CacheKey(id));
            }

            var ctx = _http.HttpContext!;
            ctx.Response.Cookies.Append(
                CookieName,
                string.Empty,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddDays(-1), // expire immediately
                    Path = "/",
                }
            );
        }

        private static string CacheKey(string id) => $"Groq_Chat_Cookie_Id:{id}";
    }
}
