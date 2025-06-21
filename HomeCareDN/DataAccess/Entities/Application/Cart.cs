using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Cart
    {
        [Key]
        public Guid CartID { get; set; }

        [Required]
        public required string UserID { get; set; }
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
