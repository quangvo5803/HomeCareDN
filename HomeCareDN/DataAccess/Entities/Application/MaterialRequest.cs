using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess.Entities.Application
{
    public class MaterialRequest
    {
        public Guid MaterialRequestID { get; set; }
        public Guid CustomerID { get; set; }
        public Guid? AddressId { get; set; }
        public Guid? SelectedDistributorApplicationID { get; set; }
        public string? Description { get; set; }
        public bool CanAddMaterial { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DeliveryDate { get; set; }
        public RequestStatus Status { get; set; } = RequestStatus.Draft;
        public Guid? ConversationID { get; set; }
        public ICollection<MaterialRequestItem>? MaterialRequestItems { get; set; }
        public ICollection<DistributorApplication>? DistributorApplications { get; set; }

        [ForeignKey("SelectedDistributorApplicationID")]
        public DistributorApplication? SelectedDistributorApplication { get; set; }

        [ForeignKey("ConversationID")]
        public Conversation? Conversation { get; set; }
        public Review? Review { get; set; }
    }

    public enum RequestStatus
    {
        [Display(Name = "Draft")]
        Draft,

        [Display(Name = "Opening")]
        Opening,

        [Display(Name = "Pending")]
        Pending,

        [Display(Name = "Closed")]
        Closed,
    }
}
