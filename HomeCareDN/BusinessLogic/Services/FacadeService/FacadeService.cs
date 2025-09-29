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
        public IContactSupportService ContactSupportService { get; }
        public IImageService ImageService { get; }

        public FacadeService(CoreDependencies core, InfraDependencies infra)
        {
            ServiceRequestService = new ServiceRequestService(
                core.UnitOfWork,
                core.Mapper,
                core.AuthorizeDbContext
            );
            MaterialService = new MaterialService(core.UnitOfWork, core.Mapper);
            ServiceService = new ServicesService(core.UnitOfWork, core.Mapper);
            ContractorApplicationService = new ContractorApplicationService(
                core.UnitOfWork,
                core.Mapper
            );
            CategoryService = new CategoryService(core.UnitOfWork, core.Mapper);
            BrandService = new BrandService(core.UnitOfWork, core.Mapper);
            AiChatService = new AiChatService(infra.Cache, infra.GroqClient, infra.Http);
            ConversationService = new ConversationService(core.UnitOfWork, core.Mapper);
            ContactSupportService = new ContactSupportService(
                core.UnitOfWork,
                core.Mapper,
                infra.EmailQueue
            );
            ImageService = new ImageService(core.UnitOfWork);
        }
    }
}
