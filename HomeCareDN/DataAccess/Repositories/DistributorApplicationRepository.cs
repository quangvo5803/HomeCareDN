using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;

namespace DataAccess.Repositories
{
    public class DistributorApplicationRepository
        : Repository<DistributorApplication>,
            IDistributorApplicationRepository
    {
        public DistributorApplicationRepository(ApplicationDbContext db)
            : base(db) { }
    }
}
