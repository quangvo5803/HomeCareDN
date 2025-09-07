using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Entities.Application
{
    public class Conversation
    {
        [Key] 
        public Guid ConversationId { get; set; }
        [Required] 
        public string CustomerId { get; set; } = null!;
        [Required] 
        public string ContractorId { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ClosedAt { get; set; }
        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

        public ICollection<ChatMessage>? Messages { get; set; }
    }
}
