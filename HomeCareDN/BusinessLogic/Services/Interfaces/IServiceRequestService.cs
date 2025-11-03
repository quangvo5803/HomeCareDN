using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ServiceRequest;

namespace BusinessLogic.Services.Interfaces
{
    public interface IServiceRequestService
    {
        Task<PagedResultDto<ServiceRequestDto>> GetAllServiceRequestAsync(
            QueryParameters parameters,
            string role = "Admin"
        );
        Task<PagedResultDto<ServiceRequestDto>> GetAllServiceRequestByUserIdAsync(
            QueryParameters parameters
        );
        Task<ServiceRequestDto> GetServiceRequestByIdAsync(
            ServiceRequestGetByIdDto getByIdDto,
            string role = "Admin"
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
