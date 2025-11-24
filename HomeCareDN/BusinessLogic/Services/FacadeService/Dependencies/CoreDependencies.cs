using AutoMapper;
using DataAccess.Data;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Net.payOS;

namespace BusinessLogic.Services.FacadeService.Dependencies
{
    public class CoreDependencies
    {
        public IUnitOfWork UnitOfWork { get; }
        public IMapper Mapper { get; }
        public IMemoryCache MemoryCache { get; }
        public AuthorizeDbContext AuthorizeDbContext { get; }
        public UserManager<ApplicationUser> UserManager { get; }
        public PayOS PayOS { get; }

        public CoreDependencies(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IMemoryCache memoryCache,
            AuthorizeDbContext authorizeDbContext,
            UserManager<ApplicationUser> userManager,
            PayOS payOS
        )
        {
            UnitOfWork = unitOfWork;
            Mapper = mapper;
            MemoryCache = memoryCache;
            AuthorizeDbContext = authorizeDbContext;
            UserManager = userManager;
            PayOS = payOS;
        }
    }
}
