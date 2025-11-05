using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;

namespace DataAccess.Repositories
{
    public class ContactSupportRepository : Repository<ContactSupport>, IContactSupportRepository
    {
        public ContactSupportRepository(ApplicationDbContext db)
            : base(db) { }
    }
}
