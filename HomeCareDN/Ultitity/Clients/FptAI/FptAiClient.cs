using System.Net.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Ultitity.Clients.FptAI
{
    public class FptAiClient : IFptAiClient
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public FptAiClient(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<string> OcrCccdAsync(IFormFile image)
        {
            using var content = new MultipartFormDataContent();
            content.Add(new StreamContent(image.OpenReadStream()), "image", image.FileName);

            var response = await _httpClient.PostAsync(_config["FptAi:OcrUrl"], content);

            var body = await response.Content.ReadAsStringAsync();

            return body;
        }

        public async Task<string> CheckFaceAsync(
            IFormFile image1,
            IFormFile image2)
        {
            using var content = new MultipartFormDataContent();

            content.Add(
                new StreamContent(image1.OpenReadStream()),
                "file[]",
                image1.FileName
            );

            content.Add(
                new StreamContent(image2.OpenReadStream()),
                "file[]",
                image2.FileName
            );

            var response = await _httpClient.PostAsync(
                _config["FptAi:CheckFaceUrl"],
                content
            );

            var body = await response.Content.ReadAsStringAsync();

            return body;
        }
    }
}
