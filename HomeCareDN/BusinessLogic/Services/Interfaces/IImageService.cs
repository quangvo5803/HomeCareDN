namespace BusinessLogic.Services.Interfaces
{
    public interface IImageService
    {
        Task DeleteImageAsync(string imageUrl);
    }
}
