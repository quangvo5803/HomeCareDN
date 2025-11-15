using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class PartnerRequest
    {
        [Key]
        public Guid PartnerRequestID { get; set; } = Guid.NewGuid();

        [Required]
        public PartnerRequestType PartnerRequestType { get; set; }

        [Required, MaxLength(255)]
        public string CompanyName { get; set; } = default!;

        [Required, EmailAddress, MaxLength(255)]
        public string Email { get; set; } = default!;

        [Required, Phone, MaxLength(30)]
        public string PhoneNumber { get; set; } = default!;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        public PartneRequestrStatus Status { get; set; } = PartneRequestrStatus.Pending;

        [MaxLength(500)]
        public string? RejectionReason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Image>? Images { get; set; } = new List<Image>();
        public ICollection<Document>? Documents { get; set; } = new List<Document>();
    }

    public enum PartnerRequestType
    {
        [Display(Name = "Distributor")]
        Distributor,

        [Display(Name = "Contractor")]
        Contractor,
    }

    public enum PartneRequestrStatus
    {
        [Display(Name = "Pending")]
        Pending,

        [Display(Name = "Approved")]
        Approved,

        [Display(Name = "Rejected")]
        Rejected,
    }
}
