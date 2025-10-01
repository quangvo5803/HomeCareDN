using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;

namespace DataAccess.Repositories
{
    public class PartnerRequestRepository : Repository<PartnerRequest>, IPartnerRepository
    {
        public PartnerRequestRepository(ApplicationDbContext db)
            : base(db) { }
    }
}
