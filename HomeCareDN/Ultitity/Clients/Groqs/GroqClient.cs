using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;

namespace Ultitity.Clients.Groqs
{
    public class GroqClient : IGroqClient
    {
        private readonly HttpClient _http;
        private readonly string _apiKey;
        private readonly string _model;

        public GroqClient(HttpClient http, IConfiguration cfg)
        {
            _http = http;
            _apiKey =
                cfg["Groq:ApiKey"]?.Trim()
                ?? throw new InvalidOperationException("Missing Groq:ApiKey");

            if (!_apiKey.StartsWith("gsk_"))
                throw new InvalidOperationException("Invalid Groq:ApiKey format.");

            var baseUrl = cfg["Groq:BaseUrl"] ?? "https://api.groq.com/openai/v1/";
            _http.BaseAddress = new Uri(baseUrl.EndsWith("/") ? baseUrl : baseUrl + "/");
            _http.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);

            _model = "llama-3.3-70b-versatile";
        }

        public async Task<string> ChatAsync(object payload)
        {
            // Tự động serialize payload sang JSON
            using var response = await _http.PostAsJsonAsync("chat/completions", payload);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException(
                    $"Groq API Error {(int)response.StatusCode}: {error}"
                );
            }

            var result = await response.Content.ReadFromJsonAsync<GroqResponse>();
            return result?.Choices?.FirstOrDefault()?.Message?.Content?.Trim() ?? "";
        }

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
