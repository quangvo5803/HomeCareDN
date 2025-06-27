using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;

namespace DataAccess.Repositories
{
    public class ContractorApplicationRepository
        : Repository<ContractorApplication>,
            IContractorApplicationRepository
    {
        private readonly ApplicationDbContext _db;

        public ContractorApplicationRepository(ApplicationDbContext db)
            : base(db)
        {
            _db = db;
        }
    }
}
