using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Authorize
{
    public class Address
    {
        public Guid AddressID { get; set; } = Guid.NewGuid();

        [Required]
        public string UserId { get; set; } = default!;
        public ApplicationUser User { get; set; } = default!;

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
