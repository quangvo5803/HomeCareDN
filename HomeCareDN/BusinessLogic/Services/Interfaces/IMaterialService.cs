using BusinessLogic.DTOs.Application.MaterialRequest;

namespace BusinessLogic.Services.Interfaces
{
    public interface IMaterialService
    {
        Task<MaterialRequestDto> CreateMaterialRequestAsync(
           MaterialRequestCreateMaterialRequestDto requestDto
       );
        Task<MaterialRequestDto> GetMaterialRequestByIdAsync(Guid id);
        Task<IEnumerable<MaterialRequestDto>> GetAllHardMaterialRequestsAsync();
        Task<MaterialRequestDto> UpdateMaterialRequestAsync(
            MaterialRequestUpdateMaterialRequestDto requestDto
        );
        Task DeleteMaterialRequestAsync(Guid id);
    }
}
