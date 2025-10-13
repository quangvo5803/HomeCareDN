using System.ComponentModel.DataAnnotations;

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
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
        public ICollection<Image>? Images { get; set; }
    }

    public enum ApplicationStatus
    {
        [Display(Name = "Đang chờ")]
        Pending,

        [Display(Name = "Được chọn")]
        Approved,

        [Display(Name = "Bị từ chối")]
        Rejected,
    }
}
