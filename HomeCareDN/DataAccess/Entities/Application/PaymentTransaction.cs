using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess.Entities.Application
{
    public class PaymentTransaction
    {
        [Key]
        public Guid PaymentTransactionID { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ContractorApplicationID { get; set; }

        [Required]
        public Guid ServiceRequestID { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required, MaxLength(200)]
        public string Description { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string ItemName { get; set; } = string.Empty;

        public long OrderCode { get; set; }

        [Required, MaxLength(500)]
        public string CheckoutUrl { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? PaymentLinkID { get; set; }

        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }

        [ForeignKey("ContractorApplicationID")]
        public ContractorApplication? ContractorApplication { get; set; }
    }


    public enum PaymentStatus
    {
        [Display(Name = "Pending")]
        Pending,
        [Display(Name = "Paid")]
        Paid,
        [Display(Name = "Failed")]
        Failed
    }
}
