namespace BusinessLogic.DTOs.Application.Cart
{
    public class CartItemUpdateRequestDto
    {
        public Guid CartItemID { get; set; }
        public int Quantity { get; set; }
    }

}
