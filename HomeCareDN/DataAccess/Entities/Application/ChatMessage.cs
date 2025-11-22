using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class ChatMessage
    {
        [Key]
        public Guid ChatMessageID { get; set; }
        public Guid? ConversationID { get; set; }
        public string? SenderID { get; set; }
        public string? ReceiverID { get; set; }
        public string? Content { get; set; } = "";
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsAdminRead { get; set; } = false;
        public Conversation? Conversation { get; set; }
    }
}
