using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;

namespace DataAccess.Repositories
{
    public class SearchHistoryRepository : Repository<SearchHistory>, ISearchHistoryRepository
    {
        public SearchHistoryRepository(ApplicationDbContext db) : base(db)
        {
            
        }
    }
}
