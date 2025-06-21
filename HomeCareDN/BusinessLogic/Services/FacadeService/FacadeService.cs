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

        public FacadeService(
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            IEmailQueue emailQueue
        )
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _emailQueue = emailQueue;
        }
    }
}
