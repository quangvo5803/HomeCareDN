using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Authorize;

namespace BusinessLogic.DTOs.Authorize.User
{
    public class UpdateUserDto
    {
        public string UserId { get; set; } = default!;

        [Required, MaxLength(200)]
        public string FullName { get; set; } = default!;

        [Phone, MaxLength(50)]
        public string? PhoneNumber { get; set; }

        public Gender? Gender { get; set; }
    }
}
