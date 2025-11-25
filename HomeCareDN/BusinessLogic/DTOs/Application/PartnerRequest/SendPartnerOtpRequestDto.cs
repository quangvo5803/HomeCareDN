using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.PartnerRequest
{
    public class SendPartnerOtpRequestDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = default!;

        [Required]
        public string CompanyName { get; set; } = default!;
    }
}
