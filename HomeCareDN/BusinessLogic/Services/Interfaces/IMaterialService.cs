using BusinessLogic.DTOs.Application.Material;

namespace BusinessLogic.Services.Interfaces
{
    public interface IMaterialService
    {
        Task<MaterialDto> CreateMaterialAsync(MaterialCreateRequestDto requestDto);
        Task<MaterialDto> GetMaterialByIdAsync(Guid id);
        Task<IEnumerable<MaterialDto>> GetAllHardMaterialAsync(MaterialGetAllRequestDto requestDto);
        Task<MaterialDto> UpdateMaterialAsync(MaterialUpdateRequestDto requestDto);
        Task DeleteMaterialAsync(Guid id);
    }
}
