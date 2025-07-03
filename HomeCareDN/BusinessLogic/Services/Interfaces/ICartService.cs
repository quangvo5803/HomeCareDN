using BusinessLogic.DTOs.Application.Cart;

namespace BusinessLogic.Services.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> CreateCartAsync(CartCreateRequestDto requestDto);
        Task<CartDto> GetCartByUserIdAsync(string userId); 
        Task DeleteCartAsync(Guid id);
    }
}
