using AutoMapper;
using BusinessLogic.DTOs.Application.Cart;
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
            var cartItem = await _unitOfWork.CartItemRepository.GetAsync(ci => ci.CartItemID == id, "Material.Images");
            return _mapper.Map<CartItemDto>(cartItem);
        }

        public async Task<IEnumerable<CartItemDto>> GetAllHardCartItemAsync(CartItemGetAllRequestDto requestDto)
        {
            var cartItems = await _unitOfWork.CartItemRepository.GetAllAsync(
                filterOn: requestDto.FilterOn,
                filterQuery: requestDto.FilterQuery,
                sortBy: requestDto.SortBy,
                isAscending: requestDto.IsAscending,
                pageNumber: requestDto.PageNumber,
                pageSize: requestDto.PageSize,
                includeProperties: "Material.Images"
            );

            if (cartItems == null || !cartItems.Any())
            {
                var errors = new Dictionary<string, string[]>
        {
            { "CartItems", new[] { "No cart items found." } },
        };
                throw new CustomValidationException(errors);
            }

            return _mapper.Map<IEnumerable<CartItemDto>>(cartItems);
        }


        public async Task<CartItemDto> UpdateCartItemAsync(CartItemUpdateRequestDto requestDto)
        {
            var cartItem = await _unitOfWork.CartItemRepository.GetAsync(ci => ci.CartItemID == requestDto.CartItemID);
            if (cartItem == null) throw new Exception("CartItem not found");
            cartItem.Quantity = requestDto.Quantity;
            await _unitOfWork.SaveAsync();
            return _mapper.Map<CartItemDto>(cartItem);
        }

        public async Task DeleteCartItemAsync(Guid id)
        {
            var cartItem = await _unitOfWork.CartItemRepository.GetAsync(ci => ci.CartItemID == id);
            if (cartItem == null) throw new Exception("CartItem not found");
            _unitOfWork.CartItemRepository.Remove(cartItem);
            await _unitOfWork.SaveAsync();
        }
    }

}
