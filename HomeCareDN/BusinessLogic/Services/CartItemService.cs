using AutoMapper;
using BusinessLogic.DTOs.Application.CartItem;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class CartItemService : ICartItemService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CartItemService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<CartItemDto> CreateCartItemAsync(CartItemCreateRequestDto requestDto)
        {
            var cartItem = _mapper.Map<CartItem>(requestDto);
            await _unitOfWork.CartItemRepository.AddAsync(cartItem);
            await _unitOfWork.SaveAsync();
            return _mapper.Map<CartItemDto>(cartItem);
        }

        public async Task<CartItemDto> GetCartItemByIdAsync(Guid id)
        {
            var cartItem = await _unitOfWork.CartItemRepository.GetAsync(
                ci => ci.CartItemID == id,
                includeProperties: "Material.Images"
            );

            if (cartItem == null)
            {
                throw new CustomValidationException(new Dictionary<string, string[]>
                {
                    { "CartItem", new[] { $"CartItem with ID {id} not found." } }
                });
            }

            return _mapper.Map<CartItemDto>(cartItem);
        }

        public async Task<IEnumerable<CartItemDto>> GetAllCartItemsByCartIdAsync(CartItemGetAllByCartIdRequestDto requestDto)
        {
            var items = await _unitOfWork.CartItemRepository.GetRangeAsync(
                ci => ci.CartID == requestDto.CartID,
                includeProperties: "Material.Images",
                sortBy: null,
                isAscending: true,
                pageNumber: 1,
                pageSize: int.MaxValue
            );
            return _mapper.Map<IEnumerable<CartItemDto>>(items);
        }

        public async Task<CartItemDto> UpdateCartItemAsync(CartItemUpdateRequestDto requestDto)
        {
            var cartItem = await _unitOfWork.CartItemRepository.GetAsync(ci => ci.CartItemID == requestDto.CartItemID);
            if (cartItem == null)
                throw new CustomValidationException(new Dictionary<string, string[]>
                {
                    { "CartItem", new[] { $"CartItem with ID {requestDto.CartItemID} not found." } }
                });

            cartItem.Quantity = requestDto.Quantity;
            await _unitOfWork.SaveAsync();

            return _mapper.Map<CartItemDto>(cartItem);
        }

        public async Task DeleteCartItemAsync(Guid id)
        {
            var cartItem = await _unitOfWork.CartItemRepository.GetAsync(ci => ci.CartItemID == id);
            if (cartItem == null)
                throw new KeyNotFoundException($"CartItem with ID {id} not found.");

            _unitOfWork.CartItemRepository.Remove(cartItem);
            await _unitOfWork.SaveAsync();
        }
    }
}
