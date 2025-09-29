using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Authorize;

namespace DataAccess.Entities.Application
{
    public class Partner
    {
        [Key]
        public Guid PartnerID { get; set; } = Guid.NewGuid();

        [Required]
        public required string FullName { get; set; }

        [Required]
        public PartnerType PartnerType { get; set; }

        [Required, MaxLength(255)]
        public string CompanyName { get; set; } = default!;

        [Required, EmailAddress, MaxLength(255)]
        public string Email { get; set; } = default!;

        [Required, Phone, MaxLength(30)]
        public string PhoneNumber { get; set; } = default!;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        public PartnerStatus Status { get; set; } = PartnerStatus.Pending;

        [MaxLength(500)]
        public string? RejectionReason { get; set; }
        public string? ApprovedUserId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ApplicationUser? AccountUser { get; set; }
        public ICollection<Image>? Images { get; set; } = new List<Image>();
    }

    public enum PartnerType
    {
        [Display(Name = "Distributor")]
        Distributor,

        [Display(Name = "Contractor")]
        Contractor,
    }

    public enum PartnerStatus
    {
        [Display(Name = "Pending")]
        Pending,

        [Display(Name = "Approved")]
        Approved,

        [Display(Name = "Rejected")]
        Rejected,
    }
}
