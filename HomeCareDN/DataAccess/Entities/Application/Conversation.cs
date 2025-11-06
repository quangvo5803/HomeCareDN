using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Conversation
    {
        [Key]
        public Guid ConversationID { get; set; }

        [Required]
        public Guid CustomerID { get; set; }

        [Required]
        public Guid ContractorID { get; set; }

        [Required]
        public Guid ServiceRequestID { get; set; }

        public bool IsLocked { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ServiceRequest? ServiceRequest { get; set; }
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
