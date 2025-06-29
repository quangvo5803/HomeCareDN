using AutoMapper;
using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;
using Microsoft.Extensions.Configuration;
using Ultitity.Email.Interface;

namespace BusinessLogic.Services.FacadeService
{
    public class FacadeService : IFacadeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly IEmailQueue _emailQueue;
        private readonly IMapper _mapper;

        public IServiceRequestService ServiceRequestService { get; }
        public IMaterialService MaterialService { get; }

        public FacadeService(
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            IEmailQueue emailQueue,
            IMapper mapper
        )
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _emailQueue = emailQueue;
            _mapper = mapper;
            ServiceRequestService = new ServiceRequestService(_unitOfWork, _mapper);
            MaterialService = new MaterialService(_unitOfWork, _mapper);
        }
    }
}
