using System.ComponentModel.DataAnnotations;
using BusinessLogic.DTOs.Authorize.AddressDtos;

namespace BusinessLogic.DTOs.Authorize.Address
{
    public class UpdateAddressDto
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
