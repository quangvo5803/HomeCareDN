using BusinessLogic.DTOs.Application.ContractorApplication;

namespace BusinessLogic.Services.Interfaces
{
    public interface IContractorApplicationService
    {
<<<<<<< HEAD
=======
        Task<PagedResultDto<ContractorApplicationFullDto>> GetAllContractorByServiceRequestIdAsync(
            QueryParameters parameters
        );
>>>>>>> develop
        Task<ContractorApplicationFullDto> CreateContractorApplicationAsync(
            ContractorCreateApplicationDto createRequest
        );
        Task<ContractorApplicationFullDto?> GetApplicationByServiceRequestIDAndContractorIDAsync(
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
