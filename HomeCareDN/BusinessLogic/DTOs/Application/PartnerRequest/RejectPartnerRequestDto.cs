using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Partner
{
    public class RejectPartnerRequestDto
    {
        [Required]
        public required Guid PartnerID { get; set; }

        [Required, MaxLength(500)]
        public string RejectionReason { get; set; } = default!;
    }
}
