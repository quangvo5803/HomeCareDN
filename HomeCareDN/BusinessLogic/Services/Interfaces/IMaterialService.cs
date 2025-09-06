using BusinessLogic.DTOs.Application.Material;

namespace BusinessLogic.Services.Interfaces
{
    public interface IMaterialService
    {
        Task<ICollection<MaterialDto>> GetAllMaterialAsync();
        Task<ICollection<MaterialDto>> GetAllMaterialByIdAsync(Guid id);
        Task<MaterialDto> CreateMaterialAsync(MaterialCreateRequestDto requestDto);
        Task<MaterialDto> GetMaterialByIdAsync(Guid id);
        Task<MaterialDto> UpdateMaterialAsync(MaterialUpdateRequestDto requestDto);
        Task DeleteMaterialAsync(Guid id);
        Task DeleteMaterialImageAsync(Guid materialId, Guid imageId);
    }
}
