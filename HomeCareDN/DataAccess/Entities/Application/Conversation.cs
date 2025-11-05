using System.ComponentModel.DataAnnotations;

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

        [Required]
        public Guid ContractorApplicationID { get; set; }
        public bool IsLocked { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;

        public ServiceRequest? ServiceRequest { get; set; }
        public ContractorApplication? ContractorApplication { get; set; }
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
