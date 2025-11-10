namespace BusinessLogic.Services.Interfaces
{
    public interface IDocumentService
    {
        Task DeleteDocumentAsync(string documentUrl);
    }
}
