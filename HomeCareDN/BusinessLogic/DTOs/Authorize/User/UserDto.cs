using BusinessLogic.DTOs.Authorize.AddressDtos;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Authorize.User
{
    public class UserDto
    {
        public required string UserID { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public string? PhoneNumber { get; set; }
        public int ProjectCount { get; set; }
        public List<AddressDto>? Address { get; set; }
    }
}