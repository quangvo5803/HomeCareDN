using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;

namespace DataAccess.Repositories
{
    public class ServiceRequestRepository : Repository<ServiceRequest>, IServiceRequestRepository
    {
        private readonly ApplicationDbContext _db;

        public ServiceRequestRepository(ApplicationDbContext db)
            : base(db)
        {
            _db = db;
        }
    }
}
