using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ServiceRequest;

namespace BusinessLogic.Services.Interfaces
{
    public interface IServiceRequestService
    {
        Task<PagedResultDto<ServiceRequestDto>> GetAllServiceRequestAsync(
            QueryParameters parameters
        );
        Task<PagedResultDto<ServiceRequestDto>> GetAllServiceRequestByUserIdAsync(
            QueryParameters parameters
        );
        Task<ServiceRequestDto> GetServiceRequestByIdAsync(Guid id);
        Task<ServiceRequestDto> CreateServiceRequestAsync(
            ServiceRequestCreateRequestDto createRequestDto
        );
        Task<ServiceRequestDto> UpdateServiceRequestAsync(
            ServiceRequestUpdateRequestDto updateRequestDto
        );
        Task DeleteServiceRequestAsync(Guid id);
    }
}
