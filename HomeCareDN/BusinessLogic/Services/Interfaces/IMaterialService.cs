using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Material;

namespace BusinessLogic.Services.Interfaces
{
    public interface IMaterialService
    {
        Task<PagedResultDto<MaterialDto>> GetAllMaterialAsync(QueryParameters parameters);
        Task<PagedResultDto<MaterialDto>> GetAllMaterialByUserIdAsync(QueryParameters parameters);
        Task<MaterialDto> CreateMaterialAsync(MaterialCreateRequestDto requestDto);
        Task<MaterialDto> GetMaterialByIdAsync(Guid id);
        Task<MaterialDto> UpdateMaterialAsync(MaterialUpdateRequestDto requestDto);
        Task DeleteMaterialAsync(Guid id);
        Task DeleteMaterialImageAsync(string imageUrl);
    }
}
