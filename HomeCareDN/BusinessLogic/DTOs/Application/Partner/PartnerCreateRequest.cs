using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Partner
{
    public class PartnerCreateRequest
    {
        [Required]
        public required string PartnerType { get; set; } = default!;

        [Required, MaxLength(255)]
        public required string FullName { get; set; } = default!;

        [Required, MaxLength(255)]
        public required string CompanyName { get; set; } = default!;

        [Required, EmailAddress, MaxLength(255)]
        public required string Email { get; set; } = default!;

        [Required, Phone, MaxLength(30)]
        public required string PhoneNumber { get; set; } = default!;

        [MaxLength(1000)]
        public string? Description { get; set; }
        public required List<string> ImageUrls { get; set; }
        public required List<string> ImagePublicIds { get; set; }
    }
}
