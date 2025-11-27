namespace Ultitity.Clients.Groqs
{
    public interface IGroqClient
    {
        Task<string> ChatAsync(object payload);
    }
}
