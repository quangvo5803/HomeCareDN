using BusinessLogic.DTOs.Application.ServiceRequest;

namespace BusinessLogic.Services.Interfaces
{
    public interface IServiceRequestService
    {
        Task<ServiceRequestDto> GetServiceRequestByIdAsync(Guid id);
        Task<IEnumerable<ServiceRequestDto>> GetAllHardServiceRequestsAsync(
            ServiceRequestGetAllDto getAllRequestDto
        );
        Task<ServiceRequestDto> CreateServiceRequestAsync(
            ServiceRequestCreateRequestDto createRequestDto
        );
        Task<ServiceRequestDto> UpdateServiceRequestAsync(
            ServiceRequestUpdateRequestDto updateRequestDto
        );
        Task DeleteServiceRequestAsync(Guid id);
    }
}
