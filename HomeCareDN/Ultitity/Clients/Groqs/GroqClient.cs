using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;

namespace Ultitity.Clients.Groqs
{
    public class GroqClient : IGroqClient
    {
        private readonly HttpClient _http;
        private readonly string _apiKey;

        public GroqClient(HttpClient http, IConfiguration config)
        {
            _http = http;
            _apiKey = ValidateAndGetApiKey(config);

            var baseUrl = config["Groq:BaseUrl"] ?? "https://api.groq.com/openai/v1/";
            _http.BaseAddress = new Uri(baseUrl.EndsWith("/") ? baseUrl : $"{baseUrl}/");
            _http.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);
        }

        public async Task<string> ChatAsync(object payload)
        {
            using var response = await _http.PostAsJsonAsync("chat/completions", payload);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException(
                    $"Groq API Error ({(int)response.StatusCode}): {error}"
                );
            }

            var result = await response.Content.ReadFromJsonAsync<GroqResponse>();
            return result?.Choices?.FirstOrDefault()?.Message?.Content?.Trim() ?? string.Empty;
        }

        private static string ValidateAndGetApiKey(IConfiguration config)
        {
            var apiKey = config["Groq:ApiKey"]?.Trim();

            if (string.IsNullOrWhiteSpace(apiKey))
                throw new InvalidOperationException("Groq:ApiKey is missing in configuration");

            if (!apiKey.StartsWith("gsk_"))
                throw new InvalidOperationException(
                    "Invalid Groq:ApiKey format (must start with 'gsk_')"
                );

            return apiKey;
        }

        // ===== RESPONSE MODELS =====
        private class GroqResponse
        {
            [JsonPropertyName("choices")]
            public List<Choice>? Choices { get; set; }
        }

        private class Choice
        {
            [JsonPropertyName("message")]
            public Message? Message { get; set; }
        }

        private class Message
        {
            [JsonPropertyName("content")]
            public string? Content { get; set; }
        }
    }
}
