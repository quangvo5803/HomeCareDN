using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Authorize
{
    public class RefreshTokenRequestDto
    {
        [Required]
        public required string RefreshToken { get; set; }

        [Required]
        public required string UserId { get; set; }
    }
}
