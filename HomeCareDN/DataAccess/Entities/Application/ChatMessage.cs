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
        public Guid ChatMessageId { get; set; }
        [Required] 
        public Guid ConversationId { get; set; }

        [ForeignKey(nameof(ConversationId))]
        public Conversation? Conversation { get; set; }

        [Required] 
        public string SenderId { get; set; } = null!;
        [Required] 
        public string ReceiverId { get; set; } = null!;
        [Required] 
        public string Content { get; set; } = "";
        public bool IsRead { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
