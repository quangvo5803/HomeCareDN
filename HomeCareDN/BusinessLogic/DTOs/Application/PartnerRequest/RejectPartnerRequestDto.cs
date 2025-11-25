using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.PartnerRequest
{
    public class RejectPartnerRequestDto
    {
        [Required]
        public required Guid PartnerRequestID { get; set; }

        [Required, MaxLength(500)]
        public string RejectionReason { get; set; } = default!;
    }
}
