using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ContractorApplication;

namespace BusinessLogic.Services.Interfaces
{
    public interface IContractorApplicationService
    {
        Task<PagedResultDto<ContractorApplicationFullDto>> GetAllContractorByServiceRequestIdAsync(QueryParameters parameters);
        Task<ContractorApplicationFullDto> CreateContractorApplicationAsync(
            ContractorCreateApplicationDto createRequest
        );
        Task<ContractorApplicationFullDto?> GetApplicationByRequestAndContractorAsync(
            ContractorGetApplicationDto getRequest
        );
        Task<ContractorApplicationPendingDto> AcceptContractorApplicationAsync(
            Guid contractorApplicationID
        );
        Task<ContractorApplicationPendingDto> RejectContractorApplicationAsync(
            Guid contractorApplicationID
        );

        Task DeleteContractorApplicationAsync(Guid id);
    }
}
