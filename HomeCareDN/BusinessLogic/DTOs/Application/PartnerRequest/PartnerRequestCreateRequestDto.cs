using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.PartnerRequest
{
    public class PartnerRequestCreateRequestDto
    {
        [Required]
        public PartnerRequestType PartnerRequestType { get; set; } = default!;

        [Required, MaxLength(255)]
        public required string CompanyName { get; set; } = default!;

        [Required, EmailAddress, MaxLength(255)]
        public required string Email { get; set; } = default!;

        [Required, Phone, MaxLength(30)]
        public required string PhoneNumber { get; set; } = default!;

        [MaxLength(1000)]
        public string? Description { get; set; }
        public string? VerificationToken { get; set; }
        public required List<string> ImageUrls { get; set; }
        public required List<string> ImagePublicIds { get; set; }
        public required List<string> DocumentUrls { get; set; }
        public required List<string> DocumentPublicIds { get; set; }
    }
}
