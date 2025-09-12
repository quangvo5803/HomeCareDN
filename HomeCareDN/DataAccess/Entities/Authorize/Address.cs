using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Entities.Authorize
{
    public class Address
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string UserId { get; set; } = default!;
        public ApplicationUser User { get; set; } = default!;

        [Required, MaxLength(100)]
        public string City { get; set; } = default!; // Thành phố

        [Required, MaxLength(100)]
        public string District { get; set; } = default!; // Quận/Huyện

        [Required, MaxLength(100)]
        public string Ward { get; set; } = default!; // Phường/Xã

        [Required, MaxLength(255)]
        public string Detail { get; set; } = default!; // Địa chỉ chi tiết
    }
}
