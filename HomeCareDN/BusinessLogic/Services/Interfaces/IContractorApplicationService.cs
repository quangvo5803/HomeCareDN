using BusinessLogic.DTOs.Application.ContractorApplication;

namespace BusinessLogic.Services.Interfaces
{
    public interface IContractorApplicationService
    {
        Task<ContractorApplicationFullDto> CreateContractorApplicationAsync(
            ContractorCreateApplicationDto createRequest
        );
        Task<ContractorApplicationFullDto?> GetApplicationByRequestAndContractorAsync(
            ContractorGetApplicationDto getRequest
        );

        Task DeleteContractorApplicationAsync(Guid id);
    }
}
