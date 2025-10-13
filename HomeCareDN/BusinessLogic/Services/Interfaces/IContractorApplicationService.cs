using BusinessLogic.DTOs.Application.ContractorApplication;

namespace BusinessLogic.Services.Interfaces
{
    public interface IContractorApplicationService
    {
        Task<ContractorApplicationFullDto> CreateContractorApplicationAsync(
            ContractorApplicationApplyDto createRequest
        );
        Task<ContractorApplicationFullDto?> GetApplicationByRequestAndContractorAsync(
            Guid serviceRequestId,
            Guid contractorId
        );
        Task DeleteContractorApplicationAsync(Guid contractorApplicationId, Guid contractorId);
    }
}
