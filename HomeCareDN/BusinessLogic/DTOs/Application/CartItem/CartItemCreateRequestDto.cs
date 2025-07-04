using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.CartItem
{
    public class CartItemCreateRequestDto
    {
        [Required]
        public Guid CartID { get; set; }
        [Required]
        public Guid MaterialID { get; set; }
        public int Quantity { get; set; } = 1;
    }

}
