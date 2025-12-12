using AutoMapper;
using BusinessLogic.Services.Interfaces;
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
        public INotificationService NotificationService { get; }
        public IMaterialService MaterialService { get; }
        public IServicesService ServicesService { get; }

        public CoreDependencies(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IMemoryCache memoryCache,
            AuthorizeDbContext authorizeDbContext,
            UserManager<ApplicationUser> userManager,
            PayOS payOS,
            INotificationService notificationService
        )
        {
            UnitOfWork = unitOfWork;
            Mapper = mapper;
            MemoryCache = memoryCache;
            AuthorizeDbContext = authorizeDbContext;
            UserManager = userManager;
            PayOS = payOS;
            NotificationService = notificationService;
            MaterialService = new MaterialService(
                unitOfWork,
                mapper,
                userManager
            );
            ServicesService = new ServicesService(unitOfWork, mapper);
        }
    }
}
