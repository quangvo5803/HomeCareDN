using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;

namespace DataAccess.Repositories
{
    public class MaterialRequestItemRepository
        : Repository<MaterialRequestItem>,
            IMaterialRequestItemRepository
    {
        public MaterialRequestItemRepository(ApplicationDbContext db)
            : base(db) { }
    }
}
