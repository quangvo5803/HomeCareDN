namespace BusinessLogic.DTOs.Application.Cart
{
    public class CartUpdateRequestDto
    {
        public Guid CartID { get; set; }
        public List<CartItemUpdateRequestDto> CartItems { get; set; } = new();
    }

}
