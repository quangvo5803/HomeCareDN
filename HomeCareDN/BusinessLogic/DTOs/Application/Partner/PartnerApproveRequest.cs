using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Partner
{
    public class PartnerApproveRequest
    {
        [Required]
        public required Guid PartnerID { get; set; }

        [Required]
        public string ApprovedUserId { get; set; } = default!;
    }
}
