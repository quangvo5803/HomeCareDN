using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class ChatMessage
    {
        [Key]
        public Guid ChatMessageID { get; set; }

        public Guid? ConversationID { get; set; }

        public Guid? SenderID { get; set; }

        public Guid? ReceiverID { get; set; }
        public string? Content { get; set; } = "";
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public Conversation? Conversation { get; set; }
    }
}
