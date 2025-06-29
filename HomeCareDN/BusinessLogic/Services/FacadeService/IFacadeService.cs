using BusinessLogic.Services.Interfaces;

namespace BusinessLogic.Services.FacadeService
{
    public interface IFacadeService
    {
        IServiceRequestService ServiceRequestService { get; }
        IServicesService ServicesService { get; }
        IContractorApplicationService ContractorApplicationService { get; }
    }
}
