using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Brand;

namespace BusinessLogic.Services.Interfaces
{
    public interface IBrandService
    {
        Task<bool> CheckBrandExisiting(string brandName, Guid? brandId = null);
        Task<PagedResultDto<BrandDto>> GetAllBrands(QueryParameters parameters);
        Task<BrandDto> GetBrandByID(Guid id);
        Task<BrandDto> CreateBrandAsync(BrandCreateRequestDto requestDto);
        Task<BrandDto> UpdateBrandAsync(BrandUpdateRequestDto requestDto);
        Task DeleteBrandAsync(Guid id);
    }
}
