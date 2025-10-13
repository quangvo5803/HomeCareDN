using AutoMapper;
using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;

namespace BusinessLogic.Services
{
    public class ContractorApplicationService : IContractorApplicationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ContractorApplicationService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
    }
}
