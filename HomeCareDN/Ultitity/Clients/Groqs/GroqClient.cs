using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace Ultitity.Clients.Groqs
{
    public class GroqClient : IGroqClient
    {
        private readonly HttpClient _http;
        private readonly string _model;
        private readonly string _path;

        public GroqClient(HttpClient http, IConfiguration config)
        {
            _http = http;

            var apiKey =
                config["Groq:ApiKey"]
                ?? throw new InvalidOperationException("Groq:ApiKey is missing");

            _model =
                config["Groq:Model"]
                ?? throw new InvalidOperationException("Groq:Model is missing");

            _path =
                config["Groq:ChatPath"]
                ?? throw new InvalidOperationException("Groq:ChatPath is missing");

            var baseUrl =
                config["Groq:BaseUrl"]
                ?? throw new InvalidOperationException("Groq:BaseUrl is missing");

            _http.BaseAddress = new Uri(baseUrl.EndsWith('/') ? baseUrl : $"{baseUrl}/");

            _http.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
        }

        public async Task<string> ChatAsync(string systemPrompt, string userPrompt)
        {
            var payload = new
            {
                model = _model,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = userPrompt },
                },
                temperature = 0.3,
                max_tokens = 1024,
            };

            try
            {
                using var response = await _http.PostAsJsonAsync(_path, payload);

                if (!response.IsSuccessStatusCode)
                {
                    return string.Empty;
                }

                var json = await response.Content.ReadFromJsonAsync<JsonElement>();

                if (
                    json.TryGetProperty("choices", out JsonElement choices)
                    && choices.GetArrayLength() > 0
                )
                {
                    var firstChoice = choices[0];
                    if (
                        firstChoice.TryGetProperty("message", out JsonElement messageProp)
                        && messageProp.TryGetProperty("content", out JsonElement contentProp)
                    )
                    {
                        return contentProp.GetString() ?? string.Empty;
                    }
                }

                return string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }

        public async Task<string> ChatAsync(object messages)
        {
            var payload = new
            {
                model = _model,
                messages,
                temperature = 0.3,
                max_tokens = 1024,
            };

            try
            {
                using var response = await _http.PostAsJsonAsync(_path, payload);

                if (!response.IsSuccessStatusCode)
                    return string.Empty;

                var json = await response.Content.ReadFromJsonAsync<JsonElement>();

                if (
                    json.TryGetProperty("choices", out JsonElement choices)
                    && choices.GetArrayLength() > 0
                )
                {
                    var firstChoice = choices[0];
                    if (
                        firstChoice.TryGetProperty("message", out JsonElement messageProp)
                        && messageProp.TryGetProperty("content", out JsonElement contentProp)
                    )
                    {
                        return contentProp.GetString() ?? string.Empty;
                    }
                }
                return string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }
    }
}
