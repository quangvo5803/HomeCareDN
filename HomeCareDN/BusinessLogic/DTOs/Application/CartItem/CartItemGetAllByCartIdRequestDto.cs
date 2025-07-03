using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.CartItem
{
    public class CartItemGetAllByCartIdRequestDto
    {
        [Required]
        public Guid CartID { get; set; }
    }
}
