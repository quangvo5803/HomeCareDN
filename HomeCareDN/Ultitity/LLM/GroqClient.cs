using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace Ultitity.LLM
{
    public class GroqClient : IGroqClient
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _cfg;

        public GroqClient(HttpClient http, IConfiguration cfg)
        {
            _http = http;
            _cfg = cfg;
        }

        public async Task<string> ChatAsync(IEnumerable<(string Role, string Content)> messages, double temperature = 0.7, string model = "llama-3.3-70b-versatile")
        {
            var apiKey = _cfg["Groq:ApiKey"];
            var url = "https://api.groq.com/openai/v1/chat/completions";

            var payload = new
            {
                model,
                messages = messages.Select(m => new { role = m.Role, content = m.Content }).ToArray(),
                temperature
            };

            var req = new HttpRequestMessage(HttpMethod.Post, url);
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
            req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var res = await _http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(json);
            var content = doc.RootElement.GetProperty("choices")[0]
                                         .GetProperty("message")
                                         .GetProperty("content")
                                         .GetString();
            return content?.Trim() ?? "(no reply)";
        }
    }
}
