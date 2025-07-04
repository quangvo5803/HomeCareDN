using BusinessLogic.DTOs.Application.CartItem;
namespace BusinessLogic.DTOs.Application.Cart
{
    public class CartDto
    {
        public Guid CartID { get; set; }
        public string UserID { get; set; } = default!;
        public List<CartItemDto> CartItems { get; set; } = new();
    }

}
