using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Authorize;

namespace DataAccess.Entities.Application
{
    public class Conversation
    {
        [Key]
        public Guid ConversationID { get; set; }

        // Request chat
        public Guid? CustomerID { get; set; }

        public Guid? ContractorID { get; set; }

        public Guid? ServiceRequestID { get; set; }

        // Support chat
        public Guid? AdminID { get; set; }
        public Guid? UserID { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ConversationType ConversationType { get; set; }

        public ServiceRequest? ServiceRequest { get; set; }
        public virtual ApplicationUser? User { get; set; }
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
