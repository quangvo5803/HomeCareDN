using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;

namespace DataAccess.Repositories
{
    public class DistributorApplicationItemRepository
        : Repository<DistributorApplicationItem>,
            IDistributorApplicationItemRepository
    {
        public DistributorApplicationItemRepository(ApplicationDbContext db)
            : base(db) { }
    }
}
