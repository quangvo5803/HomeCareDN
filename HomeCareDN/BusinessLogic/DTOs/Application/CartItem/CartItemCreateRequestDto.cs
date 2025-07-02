namespace BusinessLogic.DTOs.Application.Cart
{
    public class CartItemCreateRequestDto
    {
        public Guid CartID { get; set; }
        public Guid MaterialID { get; set; }
        public int Quantity { get; set; } = 1;
    }

}
