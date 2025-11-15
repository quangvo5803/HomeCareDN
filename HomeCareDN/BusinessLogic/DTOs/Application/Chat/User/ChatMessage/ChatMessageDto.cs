namespace BusinessLogic.DTOs.Application.Chat.User.ChatMessage
{
    public class ChatMessageDto
    {
        public Guid ChatMessageID { get; set; }
        public Guid? ConversationID { get; set; }
        public required string SenderID { get; set; }
        public required string ReceiverID { get; set; }
        public string Content { get; set; } = "";
        public DateTime SentAt { get; set; }
    }
}
