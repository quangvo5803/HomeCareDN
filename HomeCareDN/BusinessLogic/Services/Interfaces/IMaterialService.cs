using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Material;

namespace BusinessLogic.Services.Interfaces
{
    public interface IMaterialService
    {
        Task<bool> CheckMaterialExisiting(string materialName);
        Task<PagedResultDto<MaterialDto>> GetAllMaterialAsync(QueryParameters parameters);
        Task<PagedResultDto<MaterialDto>> GetAllMaterialByUserIdAsync(QueryParameters parameters);
        Task<MaterialDto> CreateMaterialAsync(MaterialCreateRequestDto requestDto);
        Task<MaterialDetailDto> GetMaterialByIdAsync(Guid id);
        Task<MaterialDto> GetMaterialByCategoryAsync(Guid id);
        Task<MaterialDto> GetMaterialByBrandAsync(Guid id);
        Task<MaterialDto> UpdateMaterialAsync(MaterialUpdateRequestDto requestDto);
        Task DeleteMaterialAsync(Guid id);
    }
}
