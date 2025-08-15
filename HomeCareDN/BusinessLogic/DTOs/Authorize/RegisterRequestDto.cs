using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Authorize
{
    public class RegisterRequestDto
    {
        [Required]
        public required string Email { get; set; }

        [Required]
        public required string FullName { get; set; }
    }
}
