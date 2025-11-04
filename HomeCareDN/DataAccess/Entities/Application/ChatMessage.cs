using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Entities.Application
{
    public class ChatMessage
    {
        [Key]
        public Guid ChatMessageID { get; set; }

        [Required]
        public Guid ConversationID { get; set; }

        [ForeignKey(nameof(ConversationID))]
        public Conversation? Conversation { get; set; }

        [Required]
        public string SenderID { get; set; } = null!;

        [Required]
        public string ReceiverID { get; set; } = null!;

        [Required]
        public string Content { get; set; } = "";
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
