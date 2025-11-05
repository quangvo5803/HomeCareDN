namespace BusinessLogic.DTOs.Application.Chat.User
{
    public class ChatMessageDto
    {
        public Guid ChatMessageID { get; set; }
        public Guid ConversationID { get; set; }
        public string SenderID { get; set; } = null!;
        public string ReceiverID { get; set; } = null!;
        public string Content { get; set; } = "";
        public DateTime SentAt { get; set; }
    }
}
