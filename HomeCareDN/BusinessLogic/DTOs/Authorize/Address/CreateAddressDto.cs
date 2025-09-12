using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Authorize.Address
{
    public class CreateAddressDto
    {
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
