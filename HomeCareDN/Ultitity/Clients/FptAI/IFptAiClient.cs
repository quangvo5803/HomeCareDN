using Microsoft.AspNetCore.Http;

namespace Ultitity.Clients.FptAI
{
    public interface IFptAiClient
    {
        Task<string> OcrCccdAsync(IFormFile image);
        Task<string> CheckFaceAsync(IFormFile img1, IFormFile img2);
    }
}
