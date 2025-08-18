using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.CartItem
{
    public class CartItemUpdateRequestDto
    {
        [Required]
        public Guid CartItemID { get; set; }
        public int Quantity { get; set; }
    }

}
