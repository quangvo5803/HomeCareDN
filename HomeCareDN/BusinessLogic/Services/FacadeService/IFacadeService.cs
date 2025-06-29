using BusinessLogic.Services.Interfaces;

namespace BusinessLogic.Services.FacadeService
{
    public interface IFacadeService
    {
        IServiceRequestService ServiceRequestService { get; }
        IMaterialService MaterialService { get; }
    }
}
