using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class CartItem
    {
        [Key]
        public Guid CartItemID { get; set; }

        public Guid CartID { get; set; }

        public Guid MaterialID { get; set; }
        public int Quantity { get; set; } = 1;

        // Navigation properties
        public Cart? Cart { get; set; }
        public Material? Material { get; set; }
    }
}
