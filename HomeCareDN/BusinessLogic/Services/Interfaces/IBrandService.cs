using BusinessLogic.DTOs.Application.Brand;

namespace BusinessLogic.Services.Interfaces
{
    public interface IBrandService
    {
        Task<ICollection<BrandDto>> GetAllBrands();
        Task<BrandDto> GetBrandByID(Guid id);
        Task<BrandDto> CreateBrandAsync(BrandCreateRequestDto requestDto);
        Task<BrandDto> UpdateBrandAsync(BrandUpdateRequestDto requestDto);
        Task DeleteBrandAsync(Guid id);
    }
}
