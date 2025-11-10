using BusinessLogic.Services.Interfaces;

namespace BusinessLogic.Services.FacadeService
{
    public interface IFacadeService
    {
        IServiceRequestService ServiceRequestService { get; }
        IMaterialService MaterialService { get; }
        IServicesService ServiceService { get; }
        IContractorApplicationService ContractorApplicationService { get; }
        ICategoryService CategoryService { get; }
        IBrandService BrandService { get; }
        IAiChatService AiChatService { get; }
        IConversationService ConversationService { get; }
        IChatMessageService ChatMessageService { get; }
        IContactSupportService ContactSupportService { get; }
        IImageService ImageService { get; }
        IPartnerRequestService PartnerService { get; }
        IPaymentService PaymentService { get; }
        IMaterialRequestService MaterialRequestService { get; }
        IStatisticService StatisticService { get; }
        IUserService UserService { get; }
    }
}
