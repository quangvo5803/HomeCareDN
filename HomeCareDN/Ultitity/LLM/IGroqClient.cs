namespace Ultitity.LLM
{
    public interface IGroqClient
    {
        Task<string> ChatAsync(IEnumerable<(string Role, string Content)> messages, double temperature = 0.7, string model = "llama-3.3-70b-versatile");
    }
}
