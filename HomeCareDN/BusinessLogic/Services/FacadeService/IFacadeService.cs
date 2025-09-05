using BusinessLogic.Services.Interfaces;

namespace BusinessLogic.Services.FacadeService
{
    public interface IFacadeService
    {
        IServiceRequestService ServiceRequestService { get; }
        IMaterialService MaterialService { get; }
        IServicesService ServicesService { get; }
        IContractorApplicationService ContractorApplicationService { get; }
        ICategoryService CategoryService { get; }
        IBrandService BrandService { get; }
        IAiChatService AiChatService { get; }
        IConversationService ConversationService { get; }

    }
}
