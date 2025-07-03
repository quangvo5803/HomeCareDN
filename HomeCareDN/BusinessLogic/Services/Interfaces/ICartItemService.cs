using BusinessLogic.DTOs.Application.CartItem;

namespace BusinessLogic.Services.Interfaces
{
    public interface ICartItemService
    {
        Task<CartItemDto> CreateCartItemAsync(CartItemCreateRequestDto requestDto);
        Task<CartItemDto> GetCartItemByIdAsync(Guid id);
        Task<IEnumerable<CartItemDto>> GetAllCartItemsByCartIdAsync(CartItemGetAllByCartIdRequestDto requestDto);
        Task<CartItemDto> UpdateCartItemAsync(CartItemUpdateRequestDto requestDto);
        Task DeleteCartItemAsync(Guid id);
    }
}
