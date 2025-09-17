namespace BusinessLogic.DTOs.Application.Chat.User
{
    public class StartConversationRequestDto
    {
        public string CustomerId { get; set; } = null!;
        public string ContractorId { get; set; } = null!;
        public string? FirstMessage { get; set; }
    }
}
