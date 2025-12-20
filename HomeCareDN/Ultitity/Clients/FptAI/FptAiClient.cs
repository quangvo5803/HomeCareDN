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
            content.Add(
                new StreamContent(image.OpenReadStream()),
                "image",
                image.FileName
            );

            var response = await _httpClient.PostAsync(
                _config["FptAi:OcrUrl"],
                content
            );

            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }

        public async Task<string> LivenessWithFaceMatchAsync(
            IFormFile cccdImage,
            IFormFile faceVideo)
        {
            using var content = new MultipartFormDataContent();

            content.Add(
                new StreamContent(cccdImage.OpenReadStream()),
                "image",
                cccdImage.FileName
            );

            content.Add(
                new StreamContent(faceVideo.OpenReadStream()),
                "video",
                faceVideo.FileName
            );

            var response = await _httpClient.PostAsync(
                _config["FptAi:LivenessUrl"],
                content
            );

            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }

    }
}
