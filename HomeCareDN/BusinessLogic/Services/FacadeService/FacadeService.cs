using AutoMapper;
using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Ultitity.Clients.Groqs;
using Ultitity.Email.Interface;

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

        public FacadeService(
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            IEmailQueue emailQueue,
            IMapper mapper,
            IDistributedCache cache,
            IHttpContextAccessor http,
            IGroqClient groqClient
        )
        {
            ServiceRequestService = new ServiceRequestService(unitOfWork, mapper);
            MaterialService = new MaterialService(unitOfWork, mapper);
            ServiceService = new ServicesService(unitOfWork, mapper);
            ContractorApplicationService = new ContractorApplicationService(unitOfWork, mapper);
            CategoryService = new CategoryService(unitOfWork, mapper);
            BrandService = new BrandService(unitOfWork, mapper);
            AiChatService = new AiChatService(cache, groqClient, http);
            ConversationService = new ConversationService(unitOfWork, mapper);
            ContactSupportService = new ContactSupportService(unitOfWork, mapper, emailQueue);
            ImageService = new ImageService(unitOfWork);
        }
    }
}
