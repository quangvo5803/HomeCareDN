using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Http;

namespace DataAccess.Repositories.Interfaces
{
    public interface IDocumentRepository : IRepository<Document>
    {
        Task UploadDocumentAsync(IFormFile file, string folder, Document document);
        Task<bool> DeleteDocumentAsync(string publicId);
        Task<bool> DeleteDocumentAsync(List<string> publicId);
    }
}
