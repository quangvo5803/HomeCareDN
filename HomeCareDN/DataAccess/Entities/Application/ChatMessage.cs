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
        public string SenderID { get; set; } = null!;

        [Required]
        public string ReceiverID { get; set; } = null!;

        [Required]
        public string Content { get; set; } = "";
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public Conversation? Conversation { get; set; }
    }
}
