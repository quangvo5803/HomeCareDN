using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Partner
{
    public class PartnerRejectRequest
    {
        [Required]
        public required Guid PartnerID { get; set; }

        [Required, MaxLength(500)]
        public string RejectionReason { get; set; } = default!;
    }
}
