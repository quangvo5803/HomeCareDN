using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Authorize
{
    public class LoginRequestDto
    {
        [Required]
        public required string Email { get; set; }
    }
}
