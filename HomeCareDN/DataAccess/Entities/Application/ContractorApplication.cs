using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class ContractorApplication
    {
        [Key]
        public Guid ContractorApplicationID { get; set; }
        public required Guid ServiceRequestID { get; set; }

        [Required]
        public required string UserID { get; set; }
        public string? Description { get; set; }
        public double EstimatePrice { get; set; }
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
