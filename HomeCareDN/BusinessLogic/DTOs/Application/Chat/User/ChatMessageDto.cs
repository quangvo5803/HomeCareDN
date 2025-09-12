namespace BusinessLogic.DTOs.Application.Chat.User
{
    public class ChatMessageDto
    {
        public Guid ChatMessageId { get; set; }
        public Guid ConversationId { get; set; }
        public string SenderId { get; set; } = null!;
        public string ReceiverId { get; set; } = null!;
        public string Content { get; set; } = "";
        public bool IsRead { get; set; }
        public DateTime SentAt { get; set; }
    }
}
