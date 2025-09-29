using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Authorize.Address
{
    public class UpdateAddressDto
    {
        [Required(ErrorMessage = "REQUIRED_USER_ID")]
        public string UserId { get; set; } = default!;

        [Required(ErrorMessage = "REQUIRED_ADDRESS_ID")]
        public Guid AddressID { get; set; }

        [Required, MaxLength(100)]
        public string City { get; set; } = default!;

        [Required, MaxLength(100)]
        public string District { get; set; } = default!;

        [Required, MaxLength(100)]
        public string Ward { get; set; } = default!;

        [Required, MaxLength(255)]
        public string Detail { get; set; } = default!;
    }
}
