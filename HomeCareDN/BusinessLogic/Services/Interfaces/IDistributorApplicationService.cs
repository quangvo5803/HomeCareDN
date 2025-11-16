using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.DistributorApplication;

namespace BusinessLogic.Services.Interfaces
{
    public interface IDistributorApplicationService
    {
        Task<PagedResultDto<DistributorApplicationDto>> GetAllDistributorApplicationByMaterialRequestId(
            QueryParameters parameters, string role = "Customer"
        );
        Task<DistributorApplicationDto?> GetDistributorApplicationByMaterialRequestId(
            DistributorApplicationGetByIdDto byIdDto
        );
        Task<DistributorApplicationDto> CreateDistributorApplicationAsync(
            DistributorCreateApplicationDto createRequest
        );
        Task DeleteDistributorApplicationAsync(Guid id);
    }
}
