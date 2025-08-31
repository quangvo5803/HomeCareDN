using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;

namespace DataAccess.Repositories
{
    public class ContractorApplicationRepository
        : Repository<ContractorApplication>,
            IContractorApplicationRepository
    {
        public ContractorApplicationRepository(ApplicationDbContext db)
            : base(db) { }
    }
}
