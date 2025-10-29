namespace DataAccess.Repositories.Interfaces
{
    public interface IDocumentRepository
    {
        Task<bool> DeleteDocumentAsync(string publicId);
    }
}
