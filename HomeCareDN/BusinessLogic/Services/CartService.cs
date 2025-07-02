

using AutoMapper;
using BusinessLogic.DTOs.Application.Cart;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class CartService : ICartService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CartService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<CartDto> CreateCartAsync(CartCreateRequestDto requestDto)
        {
            var cart = new Cart
            {
                CartID = Guid.NewGuid(),
                UserID = requestDto.UserID
            };

            await _unitOfWork.CartRepository.AddAsync(cart);
            await _unitOfWork.SaveAsync();
            return _mapper.Map<CartDto>(cart);
        }

        public async Task<CartDto> GetCartByIdAsync(Guid id)
        {
            var cart = await _unitOfWork.CartRepository.GetAsync(
                c => c.CartID == id,
                includeProperties: "CartItems.Material.Images"
            );

            return _mapper.Map<CartDto>(cart);
        }

        public async Task<IEnumerable<CartDto>> GetAllHardCartAsync(CartGetAllRequestDto requestDto)
        {
            var carts = await _unitOfWork.CartRepository.GetAllAsync(
                filterOn: !string.IsNullOrEmpty(requestDto.FilterOn) ? requestDto.FilterOn : null,
                filterQuery: requestDto.FilterQuery,
                sortBy: requestDto.SortBy,
                isAscending: requestDto.IsAscending,
                pageNumber: requestDto.PageNumber,
                pageSize: requestDto.PageSize,
                includeProperties: "CartItems.Material.Images"
            );

            if (carts == null || !carts.Any())
            {
                var errors = new Dictionary<string, string[]>
        {
            { "Cart", new[] { "No cart(s) found." } }
        };
                throw new CustomValidationException(errors);
            }

            return _mapper.Map<IEnumerable<CartDto>>(carts);
        }


        public async Task<CartDto> UpdateCartAsync(CartUpdateRequestDto requestDto)
        {
            var cart = await _unitOfWork.CartRepository.GetAsync(c => c.CartID == requestDto.CartID, "CartItems");

            if (cart == null) throw new Exception("Cart not found");

            foreach (var item in requestDto.CartItems)
            {
                var existing = cart.CartItems.FirstOrDefault(ci => ci.CartItemID == item.CartItemID);
                if (existing != null)
                {
                    existing.Quantity = item.Quantity;
                }
            }

            await _unitOfWork.SaveAsync();
            return _mapper.Map<CartDto>(cart);
        }

        public async Task DeleteCartAsync(Guid id)
        {
            var cart = await _unitOfWork.CartRepository.GetAsync(c => c.CartID == id);
            if (cart == null) throw new Exception("Cart not found");
            _unitOfWork.CartRepository.Remove(cart);
            await _unitOfWork.SaveAsync();
        }
    }

}
