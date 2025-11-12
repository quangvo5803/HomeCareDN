namespace BusinessLogic.DTOs.Application.Chat.User.ChatMessage
{
    public class ChatMessageDto
    {
        public Guid ChatMessageID { get; set; }
        public Guid? ConversationID { get; set; }
        public Guid SenderID { get; set; }
        public Guid ReceiverID { get; set; }
        public string Content { get; set; } = "";
        public DateTime SentAt { get; set; }
    }
}
