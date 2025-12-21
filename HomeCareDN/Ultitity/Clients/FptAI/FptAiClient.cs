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
            IFormFile cccdImage,
            IFormFile selfieImage)
        {
            using var content = new MultipartFormDataContent();

            content.Add(
                new StreamContent(cccdImage.OpenReadStream()),
                "file[]",
                cccdImage.FileName
            );

            content.Add(
                new StreamContent(selfieImage.OpenReadStream()),
                "file[]",
                selfieImage.FileName
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
