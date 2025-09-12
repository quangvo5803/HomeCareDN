using BusinessLogic.DTOs.Authorize.Address;
using BusinessLogic.DTOs.Authorize.AddressDtos;

namespace BusinessLogic.Services.Interfaces
{
    public interface IAddressService
    {
        Task<IReadOnlyList<AddressDto>> GetMineAsync();
        Task<AddressDto> GetByIdAsync(Guid id);
        Task<AddressDto> CreateAsync(CreateAddressDto dto);
        Task UpdateAsync(Guid id, UpdateAddressDto dto);
        Task DeleteAsync(Guid id);
    }
}
