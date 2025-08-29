using BusinessLogic.DTOs.Application.Material;

namespace BusinessLogic.Services.Interfaces
{
    public interface IMaterialService
    {
        Task<MaterialDto> CreateMaterialAsync(MaterialCreateRequestDto requestDto);
        Task<MaterialDto> GetMaterialByIdAsync(Guid id);
        Task<MaterialDto> UpdateMaterialAsync(MaterialUpdateRequestDto requestDto);
        Task DeleteMaterialAsync(Guid id);
    }
}
