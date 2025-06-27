using BusinessLogic.DTOs.Application.ContractorApplication;

namespace BusinessLogic.Services.Interfaces
{
    public interface IContractorApplicationService
    {
        Task<List<ContractorApplicationDto>> GetAllContractorApplicationsAsync(
            ContractorApplicationGetAllRequestDto getAllRequestDto
        );
        Task<ContractorApplicationDto> GetContractorApplicationByIdAsync(
            Guid contractorApplicationId
        );
        Task<List<ContractorApplicationDto>> GetContractorApplicationByServiceRequestIDAsync(
            ContractorApplicationGetByServiceRequestDto requestDto
        );

        Task<ContractorApplicationDto> CreateContractorApplicationAsync(
            ContractorApplicationCreateRequestDto createRequestDto
        );
        Task<ContractorApplicationDto> UpdateContractorApplicationAsync(
            ContractorApplicationUpdateRequestDto updateRequestDto
        );
        Task DeleteContractorApplicationAsync(Guid contractorApplicationId);
    }
}
