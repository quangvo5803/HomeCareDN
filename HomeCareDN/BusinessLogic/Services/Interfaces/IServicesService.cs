using BusinessLogic.DTOs.Application.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Services.Interfaces
{
    public interface IServicesService
    {
        Task<IEnumerable<ServiceDto>> GetAllServiceAsync();
        Task<ServiceDto> CreateServiceAsync(ServiceCreateRequestDto serviceCreateDto);
        Task<ServiceDto> GetServiceByIdAsync(Guid id);
        Task<ServiceDto> UpdateServiceAsync(ServiceUpdateRequestDto serviceUpdateDto);
        Task DeleteServiceAsync(Guid id);
    }
}
