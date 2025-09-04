using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Http;

namespace DataAccess.Repositories.Interfaces
{
    public interface IImageRepository : IRepository<Image>
    {
        Task UploadImageAsync(IFormFile file, string folder, Image image);
        Task<bool> DeleteImageAsync(string publicId);
    }
}
