using AutoMapper;
using DataAccess.Data;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Net.payOS;

namespace BusinessLogic.Services.FacadeService.Dependencies
{
    public class CoreDependencies
    {
        public IUnitOfWork UnitOfWork { get; }
        public IMapper Mapper { get; }
        public AuthorizeDbContext AuthorizeDbContext { get; }
        public UserManager<ApplicationUser> UserManager { get; }
        public PayOS PayOSClient { get; }

        public CoreDependencies(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            AuthorizeDbContext authorizeDbContext,
            UserManager<ApplicationUser> userManager,
            PayOS payOSClient
        )
        {
            UnitOfWork = unitOfWork;
            Mapper = mapper;
            AuthorizeDbContext = authorizeDbContext;
            UserManager = userManager;
            PayOSClient = payOSClient;
        }
    }
}
