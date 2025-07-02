using BusinessLogic.DTOs.Application.Cart;
using BusinessLogic.DTOs.Application.Material;
namespace BusinessLogic.Services.Interfaces
{
    public interface ICartItemService
    {
        Task<CartItemDto> CreateCartItemAsync(CartItemCreateRequestDto requestDto);
        Task<CartItemDto> GetCartItemByIdAsync(Guid id);
        Task<IEnumerable<CartItemDto>> GetAllHardCartItemAsync(CartItemGetAllRequestDto requestDto);
        Task<CartItemDto> UpdateCartItemAsync(CartItemUpdateRequestDto requestDto);
        Task DeleteCartItemAsync(Guid id);
    }
}
