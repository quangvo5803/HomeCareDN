using BusinessLogic.DTOs.Application.Cart;
using BusinessLogic.DTOs.Application.Material;
namespace BusinessLogic.Services.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> CreateCartAsync(CartCreateRequestDto requestDto);
        Task<CartDto> GetCartByIdAsync(Guid id);
        Task<IEnumerable<CartDto>> GetAllHardCartAsync(CartGetAllRequestDto requestDto);
        Task<CartDto> UpdateCartAsync(CartUpdateRequestDto requestDto);
        Task DeleteCartAsync(Guid id);
    }
}
