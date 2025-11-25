using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.PartnerRequest
{
    public class VerifyPartnerOtpRequestDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = default!;

        [Required]
        public string OtpCode { get; set; } = default!;
    }
}
