using BusinessLogic.Services;
using BusinessLogic.Services.FacadeService;
using BusinessLogic.Services.Interfaces;

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
    public IContactSupportService ContactSupportService { get; }
    public IImageService ImageService { get; }
    public IPartnerRequestService PartnerService { get; }

    public FacadeService(
        CoreDependencies coreDeps,
        InfraDependencies infraDeps,
        IdentityDependencies identityDeps
    )
    {
        ServiceRequestService = new ServiceRequestService(
            coreDeps.UnitOfWork,
            coreDeps.Mapper,
            coreDeps.AuthorizeDbContext
        );

        MaterialService = new MaterialService(
            coreDeps.UnitOfWork,
            coreDeps.Mapper,
            identityDeps.UserManager
        );
        ServiceService = new ServicesService(coreDeps.UnitOfWork, coreDeps.Mapper);
        ContractorApplicationService = new ContractorApplicationService(
            coreDeps.UnitOfWork,
            coreDeps.Mapper
        );
        CategoryService = new CategoryService(coreDeps.UnitOfWork, coreDeps.Mapper);
        BrandService = new BrandService(coreDeps.UnitOfWork, coreDeps.Mapper);

        AiChatService = new AiChatService(infraDeps.Cache, infraDeps.GroqClient, infraDeps.Http);
        ConversationService = new ConversationService(coreDeps.UnitOfWork, coreDeps.Mapper);
        ContactSupportService = new ContactSupportService(
            coreDeps.UnitOfWork,
            coreDeps.Mapper,
            infraDeps.EmailQueue
        );
        ImageService = new ImageService(coreDeps.UnitOfWork);

        PartnerService = new PartnerRequestService(
            coreDeps.UnitOfWork,
            coreDeps.Mapper,
            identityDeps.UserManager,
            infraDeps.EmailQueue
        );
    }
}
