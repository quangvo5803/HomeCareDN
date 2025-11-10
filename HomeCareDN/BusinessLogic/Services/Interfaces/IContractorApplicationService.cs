using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ContractorApplication;

namespace BusinessLogic.Services.Interfaces
{
    public interface IContractorApplicationService
    {
        Task<
            PagedResultDto<ContractorApplicationDto>
        > GetAllContractorApplicationByServiceRequestIdAsync(
            QueryParameters parameters,
            string role = "Customer"
        );

        Task<PagedResultDto<ContractorApplicationDto>> GetAllContractorApplicationByUserIdAsync(
            QueryParameters parameters
        );

        Task<ContractorApplicationDto?> GetContractorApplicationByServiceRequestIDAsync(
            ContractorApplicationGetDto contractorApplicationGetDto
        );

        Task<ContractorApplicationDto> GetContractorApplicationByIDAsync(
            Guid id,
            string role = "Customer"
        );
        Task<ContractorDashBoardDto> GetContractorDashboardDataAsync(Guid contractorId);
        Task<ContractorApplicationDto> CreateContractorApplicationAsync(
            ContractorCreateApplicationDto createRequest
        );
        Task<ContractorApplicationDto> AcceptContractorApplicationAsync(
            Guid contractorApplicationID
        );
        Task<ContractorApplicationDto> RejectContractorApplicationAsync(
            Guid contractorApplicationID
        );
        Task DeleteContractorApplicationAsync(Guid id);
    }
}
