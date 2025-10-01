using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Partner
{
    public class ApprovePartnerRequestDto
    {
        [Required]
        public required Guid PartnerID { get; set; }

        [Required]
        public string ApprovedUserId { get; set; } = default!;
    }
}
