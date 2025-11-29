namespace Ultitity.Clients.Groqs
{
    public interface IGroqClient
    {
        Task<string> ChatAsync(string systemPrompt, string userPrompt);
    }
}
