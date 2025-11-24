using BusinessLogic.Services.FacadeService.Dependencies;
using BusinessLogic.Services.Interfaces;

namespace BusinessLogic.Services.FacadeService
{
    public class FacadeService : IFacadeService
    {
        public IServiceRequestService ServiceRequestService { get; }
        public IMaterialService MaterialService { get; }
        public IServicesService ServiceService { get; }
        public IContractorApplicationService ContractorApplicationService { get; }
        public ICategoryService CategoryService { get; }
        public IBrandService BrandService { get; }
        public IAiChatService AiChatService { get; }
        public IConversationService ConversationService { get; }
        public IChatMessageService ChatMessageService { get; }
        public IContactSupportService ContactSupportService { get; }
        public IImageService ImageService { get; }
        public IDocumentService DocumentService { get; }
        public IPartnerRequestService PartnerService { get; }
        public IPaymentService PaymentService { get; }
        public IMaterialRequestService MaterialRequestService { get; }
        public IReviewService ReviewService { get; }
        public IStatisticService StatisticService { get; }
        public IUserService UserService { get; }
        public IDistributorApplicationService DistributorApplicationService { get; }
        public INotificationService NotificationService { get; }

        public FacadeService(
            CoreDependencies coreDeps,
            InfraDependencies infraDeps,
            IdentityDependencies identityDeps
        )
        {
            ServiceRequestService = new ServiceRequestService(
                coreDeps.UnitOfWork,
                coreDeps.Mapper,
                coreDeps.AuthorizeDbContext,
                coreDeps.UserManager,
                infraDeps.Notifier,
                coreDeps.NotificationService
            );

            MaterialService = new MaterialService(
                coreDeps.UnitOfWork,
                coreDeps.Mapper,
                identityDeps.UserManager
            );
            ServiceService = new ServicesService(coreDeps.UnitOfWork, coreDeps.Mapper);
            ContractorApplicationService = new ContractorApplicationService(
                coreDeps.UnitOfWork,
                coreDeps.Mapper,
                identityDeps.UserManager,
                infraDeps.Notifier,
                coreDeps.NotificationService
            );
            CategoryService = new CategoryService(coreDeps.UnitOfWork, coreDeps.Mapper);
            BrandService = new BrandService(coreDeps.UnitOfWork, coreDeps.Mapper);

            AiChatService = new AiChatService(
                infraDeps.Cache,
                infraDeps.GroqClient,
                infraDeps.Http
            );
            ConversationService = new ConversationService(
                coreDeps.UnitOfWork,
                coreDeps.Mapper,
                identityDeps.UserManager
            );
            ChatMessageService = new ChatMessageService(
                coreDeps.UnitOfWork,
                coreDeps.Mapper,
                infraDeps.Notifier,
                identityDeps.UserManager
            );
            ContactSupportService = new ContactSupportService(
                coreDeps.UnitOfWork,
                coreDeps.Mapper,
                infraDeps.EmailQueue
            );
            ImageService = new ImageService(coreDeps.UnitOfWork);
            DocumentService = new DocumentService(coreDeps.UnitOfWork);

            PartnerService = new PartnerRequestService(
                coreDeps.UnitOfWork,
                coreDeps.Mapper,
                identityDeps.UserManager,
                infraDeps.EmailQueue
            );

            PaymentService = new PaymentService(
                coreDeps.PayOS,
                coreDeps.UnitOfWork,
                infraDeps.PayOsOptions,
                infraDeps.Notifier,
                coreDeps.UserManager,
                coreDeps.Mapper
            );

            MaterialRequestService = new MaterialRequestService(
                coreDeps.UnitOfWork,
                coreDeps.Mapper,
                coreDeps.AuthorizeDbContext,
                coreDeps.UserManager,
                infraDeps.Notifier,
                coreDeps.NotificationService
            );

            ReviewService = new ReviewService(
                coreDeps.UnitOfWork,
                coreDeps.Mapper,
                coreDeps.UserManager
            );

            StatisticService = new StatisticService(coreDeps.UnitOfWork, identityDeps.UserManager);

            UserService = new UserService(
                coreDeps.Mapper,
                identityDeps.UserManager,
                coreDeps.UnitOfWork,
                coreDeps.AuthorizeDbContext
            );

            DistributorApplicationService = new DistributorApplicationService(
                coreDeps.UnitOfWork,
                coreDeps.Mapper,
                identityDeps.UserManager,
                infraDeps.Notifier,
                coreDeps.NotificationService
            );

            NotificationService = new NotificationService(
                coreDeps.UnitOfWork,
                coreDeps.Mapper,
                infraDeps.Notifier,
                identityDeps.UserManager
            );
        }
    }
}
