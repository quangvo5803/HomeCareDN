using BusinessLogic.DTOs.Application.Material;

namespace BusinessLogic.DTOs.Application.CartItem
{
    public class CartItemDto
    {
        public Guid CartItemID { get; set; }
        public Guid CartID { get; set; }
        public Guid MaterialID { get; set; }
        public int Quantity { get; set; }

        public MaterialDto? Material { get; set; }
    }

}
