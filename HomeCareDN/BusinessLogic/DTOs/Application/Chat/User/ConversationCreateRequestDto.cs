namespace BusinessLogic.DTOs.Application.Chat.User
{
    public class ConversationCreateRequestDto
    {
        public Guid ServiceRequestID { get; set; }
        public string CustomerID { get; set; } = null!;
        public string ContractorID { get; set; } = null!;
    }
}
