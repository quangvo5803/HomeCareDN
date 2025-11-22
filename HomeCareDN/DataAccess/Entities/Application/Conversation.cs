using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Conversation
    {
        [Key]
        public Guid ConversationID { get; set; }

        // Request chat
        public string? CustomerID { get; set; }
        public string? ContractorID { get; set; }
        public Guid? ServiceRequestID { get; set; }

        // Support chat
        public string? AdminID { get; set; }
        public string? UserID { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ConversationType ConversationType { get; set; }
        public bool IsAdminRead { get; set; } = false;
        public ServiceRequest? ServiceRequest { get; set; }
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }

    public enum ConversationType
    {
        [Display(Name = "ServiceRequest")]
        ServiceRequest,

        [Display(Name = "AdminSupport")]
        AdminSupport,
    }
}
