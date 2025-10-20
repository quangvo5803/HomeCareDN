using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;

namespace DataAccess.Repositories
{
    public class MaterialRequestRepository : Repository<MaterialRequest>, IMaterialRequestRepository
    {
        public MaterialRequestRepository(ApplicationDbContext db)
            : base(db) { }
    }
}
