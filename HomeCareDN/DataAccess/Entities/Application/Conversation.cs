using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Entities.Application
{
    public class Conversation
    {
        [Key]
        public Guid ConversationID { get; set; }

        [Required]
        public string CustomerID { get; set; } = null!;

        [Required]
        public string ContractorID { get; set; } = null!;

        [Required]
        public Guid ServiceRequestID { get; set; }

        [ForeignKey(nameof(ServiceRequestID))]
        public ServiceRequest? ServiceRequest { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

        public ICollection<ChatMessage>? Messages { get; set; }
    }
}
