using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class ContractorApplication
    {
        [Key]
        public Guid ContractorApplicationID { get; set; }

        [Required]
        public required string UserID { get; set; }
        public string? Description { get; set; }
        public double EstimatePrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    }

    public enum ApplicationStatus
    {
        Pending,
        Approved,
        Rejected,
    }
}
