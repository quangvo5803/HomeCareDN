using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class ChatMessage
    {
        [Key]
        public Guid ChatMessageID { get; set; }

        [Required]
        public Guid ConversationID { get; set; }

        [Required]
        public Guid SenderID { get; set; }

        [Required]
        public Guid ReceiverID { get; set; }

        [Required]
        public string Content { get; set; } = "";
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public Conversation? Conversation { get; set; }
    }
}
