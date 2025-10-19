using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.MaterialRequest;
using BusinessLogic.Services.Interfaces;

namespace BusinessLogic.Services
{
    public class MaterialRequestService : IMaterialRequestService
    {
        public Task<MaterialRequestDto> CreateNewMaterialRequestAsync(
            MaterialRequestCreateRequestDto materialRequestCreateDto
        )
        {
            throw new NotImplementedException();
        }

        public Task<PagedResultDto<MaterialRequestDto>> GetAllMaterialRequestByUserIdAsync(
            QueryParameters queryParameters
        )
        {
            throw new NotImplementedException();
        }

        public Task<PagedResultDto<MaterialRequestDto>> GetAllMaterialRequestsAsync(
            QueryParameters queryParameters
        )
        {
            throw new NotImplementedException();
        }

        public Task<MaterialRequestDto> GetMaterialRequestByIdAsync(Guid materialRequestId)
        {
            throw new NotImplementedException();
        }

        public Task<MaterialRequestDto> UpdateMaterialRequestAsync(
            MaterialRequestUpdateRequestDto materialRequestUpdateRequestDto
        )
        {
            throw new NotImplementedException();
        }
    }
}
