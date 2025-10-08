using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Service;

namespace BusinessLogic.Services.Interfaces
{
    public interface IServicesService
    {
        Task<PagedResultDto<ServiceDto>> GetAllServicesAsync(QueryParameters parameters);
        Task<ServiceDto> CreateServiceAsync(ServiceCreateRequestDto serviceCreateDto);
        Task<ServiceDetailDto> GetServiceByIdAsync(Guid id);
        Task<ServiceDto> UpdateServiceAsync(ServiceUpdateRequestDto serviceUpdateDto);
        Task DeleteServiceAsync(Guid id);
    }
}
