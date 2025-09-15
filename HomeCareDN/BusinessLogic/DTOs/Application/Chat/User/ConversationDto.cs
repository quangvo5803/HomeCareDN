namespace BusinessLogic.DTOs.Application.Chat.User
{
    public class ConversationDto
    {
        public Guid ConversationId { get; set; }
        public string CustomerId { get; set; } = null!;
        public string ContractorId { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public DateTime LastMessageAt { get; set; }
    }
}
