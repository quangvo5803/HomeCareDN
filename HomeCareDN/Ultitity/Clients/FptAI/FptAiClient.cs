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

            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }

        public async Task<string> LivenessWithFaceMatchAsync(
            IFormFile cccdImage,
            byte[] faceVideoBytes,
            string fileName = "face-video.mp4",
            string contentType = "video/mp4"
        )
        {
            using var content = new MultipartFormDataContent();

            // Thêm CCCD Image như cũ
            content.Add(new StreamContent(cccdImage.OpenReadStream()), "image", cccdImage.FileName);

            // Thêm video từ byte[]
            var videoStream = new MemoryStream(faceVideoBytes);
            var videoContent = new StreamContent(videoStream);
            videoContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(
                contentType
            );

            content.Add(videoContent, "video", fileName);

            var response = await _httpClient.PostAsync(_config["FptAi:LivenessUrl"], content);

            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
    }
}
