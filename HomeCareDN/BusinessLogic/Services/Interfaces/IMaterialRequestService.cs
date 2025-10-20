using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.MaterialRequest;

namespace BusinessLogic.Services.Interfaces
{
    public interface IMaterialRequestService
    {
        Task<PagedResultDto<MaterialRequestDto>> GetAllMaterialRequestsAsync(
            QueryParameters queryParameters
        );
        Task<PagedResultDto<MaterialRequestDto>> GetAllMaterialRequestByUserIdAsync(
            QueryParameters queryParameters
        );
        Task<MaterialRequestDto> GetMaterialRequestByIdAsync(Guid materialRequestId);
        Task<MaterialRequestDto> CreateNewMaterialRequestAsync(
            MaterialRequestCreateRequestDto materialRequestCreateDto
        );
        Task<MaterialRequestDto> UpdateMaterialRequestAsync(
            MaterialRequestUpdateRequestDto materialRequestUpdateRequestDto
        );
    }
}
