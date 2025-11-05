namespace BusinessLogic.DTOs.Application.Chat.User
{
    public class SendMessageRequestDto
    {
        public Guid ConversationID { get; set; }
        public string SenderID { get; set; } = null!;
        public string ReceiverID { get; set; } = null!;
        public string Content { get; set; } = "";
    }
}
