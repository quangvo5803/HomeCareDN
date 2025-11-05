namespace BusinessLogic.DTOs.Application.Chat.User
{
    public class ConversationDto
    {
        public Guid ConversationID { get; set; }
        public string CustomerID { get; set; } = null!;
        public string ContractorID { get; set; } = null!;
        public Guid ServiceRequestID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastMessageAt { get; set; }
    }
}
