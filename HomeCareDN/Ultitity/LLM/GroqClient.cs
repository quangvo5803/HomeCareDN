using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace Ultitity.LLM
{
    public class GroqClient : IGroqClient
    {
        private readonly HttpClient _http;
        private readonly string _apiKey;
        private readonly string _chatPath;

        public GroqClient(HttpClient http, IConfiguration cfg)
        {
            _http = http;

            _apiKey =
                cfg["Groq:ApiKey"] ?? throw new InvalidOperationException("Missing Groq:ApiKey");

            _chatPath = cfg["Groq:ChatPath"] ?? "chat/completions";
        }

        public async Task<string> ChatAsync(
            IEnumerable<(string Role, string Content)> messages,
            double temperature = 0.7,
            string model = "llama-3.3-70b-versatile"
        )
        {
            var payload = new
            {
                model,
                messages = messages
                    .Select(m => new { role = m.Role, content = m.Content })
                    .ToArray(),
                temperature,
            };

            using var req = new HttpRequestMessage(HttpMethod.Post, _chatPath);
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            req.Content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json"
            );

            using var res = await _http.SendAsync(req);
            var json = await res.Content.ReadAsStringAsync();

            if (!res.IsSuccessStatusCode)
                throw new HttpRequestException($"Groq error {(int)res.StatusCode}: {json}");

            using var doc = JsonDocument.Parse(json);
            var content = doc
                .RootElement.GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return content?.Trim() ?? "(no reply)";
        }
    }
}
