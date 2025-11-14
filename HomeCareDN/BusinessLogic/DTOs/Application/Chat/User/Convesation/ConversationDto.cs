namespace BusinessLogic.DTOs.Application.Chat.User.Convesation
{
    public class ConversationDto
    {
        public Guid ConversationID { get; set; }
        public string? CustomerID { get; set; }
        public string? ContractorID { get; set; }
        public string? AdminID { get; set; }
        public string? UserID { get; set; }
        public string? UserEmail { get; set; }
        public string? UserName { get; set; }
        public Guid? ServiceRequestID { get; set; }
        public int AdminUnreadCount { get; set; }
        public required string ConversationType { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
