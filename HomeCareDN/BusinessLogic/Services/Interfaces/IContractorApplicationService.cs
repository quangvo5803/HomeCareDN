using BusinessLogic.DTOs.Application.ContractorApplication;

namespace BusinessLogic.Services.Interfaces
{
    public interface IContractorApplicationService
    {
<<<<<<< HEAD
        Task<
            PagedResultDto<ContractorApplicationDto>
        > GetAllContractorApplicationByServiceRequestIdAsync(
            QueryParameters parameters,
            string role = "Customer"
        );
        Task<ContractorApplicationDto?> GetContractorApplicationByServiceRequestIDAsync(
            ContractorApplicationGetDto contractorApplicationGetDto
=======
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
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
        );

        Task<ContractorApplicationDto> GetContractorApplicationByIDAsync(
            Guid id,
            string role = "Customer"
        );
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
