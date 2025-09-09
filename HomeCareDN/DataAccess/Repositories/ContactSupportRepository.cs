using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Repositories
{
    public class ContactSupportRepository : Repository<ContactSupport>, IContactSupportRepository
    {
        public ContactSupportRepository(ApplicationDbContext db) : base(db) { }
    }
}
