namespace BusinessLogic.DTOs.Application.Chat.User.Convesation
{
    public class ConversationDto
    {
        public Guid ConversationID { get; set; }
        public Guid CustomerID { get; set; }
        public Guid ContractorID { get; set; }
        public Guid ServiceRequestID { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
