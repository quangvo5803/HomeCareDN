using BusinessLogic.DTOs.Authorize.Address;
using BusinessLogic.DTOs.Authorize.AddressDtos;

namespace BusinessLogic.Services.Interfaces
{
    public interface IAddressService
    {
        Task<ICollection<AddressDto>> GetAddressByUserIdAsync(string userId);
        Task<AddressDto> CreateAddressByUserIdAsync(CreateAddressDto dto);
        Task<AddressDto> UpdateAddressAsync(UpdateAddressDto dto);
        Task DeleteAddressAsync(Guid addressId);
    }
}
