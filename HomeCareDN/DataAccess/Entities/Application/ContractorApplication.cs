using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess.Entities.Application
{
    public class ContractorApplication
    {
        [Key]
        public Guid ContractorApplicationID { get; set; }
        public required Guid ServiceRequestID { get; set; }
        public required Guid ContractorID { get; set; }
        public required string Description { get; set; }
        public required double EstimatePrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DueCommisionTime { get; set; }
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
        public ICollection<Image>? Images { get; set; }

        public ICollection<Document>? Documents { get; set; }

        [ForeignKey("ServiceRequestID")]
        public ServiceRequest? ServiceRequest { get; set; }
    }

    public enum ApplicationStatus
    {
        [Display(Name = "Pending")]
        Pending,

        [Display(Name = "PendingCommission")]
        PendingCommission,

        [Display(Name = "Approved")]
        Approved,

        [Display(Name = "Rejected")]
        Rejected,
    }
}
