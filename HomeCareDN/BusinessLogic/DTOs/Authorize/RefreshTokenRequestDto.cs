using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Authorize
{
    public class RefreshTokenRequestDto
    {
        [Required]
        public string RefreshToken { get; set; }
    }
}
