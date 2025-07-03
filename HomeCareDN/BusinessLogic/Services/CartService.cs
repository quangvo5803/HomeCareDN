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
            var existing = await _unitOfWork.CartRepository.GetAsync(c => c.UserID == requestDto.UserID);
            if (existing != null)
            {
                return _mapper.Map<CartDto>(existing);
            }

            var cart = _mapper.Map<Cart>(requestDto);

            await _unitOfWork.CartRepository.AddAsync(cart);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<CartDto>(cart);
        }


        public async Task<CartDto> GetCartByUserIdAsync(string userId)
        {
            var cart = await _unitOfWork.CartRepository.GetAsync(
                c => c.UserID == userId,
                includeProperties: "CartItems.Material.Images"
            );

            if (cart == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Cart", new[] { $"No cart found for user {userId}." } }
                };
                throw new CustomValidationException(errors);
            }

            return _mapper.Map<CartDto>(cart);
        }

        public async Task DeleteCartAsync(Guid id)
        {
            var cart = await _unitOfWork.CartRepository.GetAsync(c => c.CartID == id);

            if (cart == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Cart", new[] { $"Cart with ID {id} not found." } }
                };
                throw new CustomValidationException(errors);
            }

            _unitOfWork.CartRepository.Remove(cart);
            await _unitOfWork.SaveAsync();
        }
    }
}
