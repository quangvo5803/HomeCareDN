using BusinessLogic.DTOs.Application.ServiceRequest;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.Services.Interfaces
{
    public interface IServiceRequestService
    {
        Task<ServiceRequestDto> CreateServiceRequestAsync(
            ServiceRequestCreateRequestDto requestDto
        );
        Task<ServiceRequestDto> GetServiceRequestByIdAsync(Guid id);
        Task<IEnumerable<ServiceRequestDto>> GetAllHardServiceRequestsAsync();
        Task<ServiceRequestDto> UpdateServiceRequestAsync(
            ServiceRequestUpdateRequestDto requestDto
        );
        Task DeleteServiceRequestAsync(Guid id);
    }
}
