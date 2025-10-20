using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.MaterialRequest;

namespace BusinessLogic.Services.Interfaces
{
    public interface IMaterialRequestService
    {
        Task<PagedResultDto<MaterialRequestDto>> GetAllMaterialRequestsAsync(
            QueryParameters parameters
        );
        Task<PagedResultDto<MaterialRequestDto>> GetAllMaterialRequestByUserIdAsync(
            QueryParameters parameters
        );
        Task<MaterialRequestDto> GetMaterialRequestByIdAsync(Guid materialRequestID);
        Task<MaterialRequestDto> CreateNewMaterialRequestAsync(
            MaterialRequestCreateRequestDto materialRequestCreateDto
        );
        Task<MaterialRequestDto> UpdateMaterialRequestAsync(
            MaterialRequestUpdateRequestDto materialRequestUpdateRequestDto
        );
        Task DeleteMaterialRequest(Guid materialRequestID);
    }
}
