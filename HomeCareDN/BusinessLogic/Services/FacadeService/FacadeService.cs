using AutoMapper;
using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;
using Microsoft.Extensions.Configuration;
using Ultitity.Email.Interface;

namespace BusinessLogic.Services.FacadeService
{
    public class FacadeService : IFacadeService
    {
        public IServiceRequestService ServiceRequestService { get; }
        public IMaterialService MaterialService { get; }
        public IServicesService ServicesService { get; }
        public IContractorApplicationService ContractorApplicationService { get; }
        public ICategoryService CategoryService { get; }
        public IBrandService BrandService { get; }

        public FacadeService(
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            IEmailQueue emailQueue,
            IMapper mapper
        )
        {
            ServiceRequestService = new ServiceRequestService(unitOfWork, mapper);
            MaterialService = new MaterialService(unitOfWork, mapper);
            ServicesService = new ServicesService(unitOfWork, mapper);
            ContractorApplicationService = new ContractorApplicationService(unitOfWork, mapper);
            CategoryService = new CategoryService(unitOfWork, mapper);
            BrandService = new BrandService(unitOfWork, mapper);
        }
    }
}
