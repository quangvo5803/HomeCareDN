using BusinessLogic.DTOs.Application.Service;

namespace BusinessLogic.Services.Interfaces
{
    public interface IServicesService
    {
        Task<IEnumerable<ServiceDto>> GetAllServiceAsync(ServiceGetAllDto getAllDto);
        Task<ServiceDto> CreateServiceAsync(ServiceCreateRequestDto serviceCreateDto);
        Task<ServiceDto> GetServiceByIdAsync(Guid id);
        Task<ServiceDto> UpdateServiceAsync(ServiceUpdateRequestDto serviceUpdateDto);
        Task DeleteServiceAsync(Guid id);
    }
}
