using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Authorize
{
    public class VerifyOtpRequestDto
    {
        [Required]
        public required string Email { get; set; }

        [Required]
        public required string OTP { get; set; }
    }
}
