using Microsoft.AspNetCore.Http;

namespace Ultitity.Clients.FptAI
{
    public interface IFptAiClient
    {
        Task<string> OcrCccdAsync(IFormFile image);
        Task<string> LivenessWithFaceMatchAsync(
            IFormFile cccdImage,
            byte[] faceVideoBytes,
            string fileName = "face-video.mp4",
            string contentType = "video/mp4"
        );
    }
}
