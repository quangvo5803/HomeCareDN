namespace BusinessLogic.DTOs.Chat.User
{
    public class StartConversationRequestDto
    {
        public string CustomerId { get; set; } = null!;
        public string ContractorId { get; set; } = null!;
        public string? FirstMessage { get; set; }
    }
}
