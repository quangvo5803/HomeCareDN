using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;

namespace DataAccess.Repositories
{
    public class PaymentTransactionsRepository : Repository<PaymentTransaction>, IPaymentTransactionsRepository
    {
        public PaymentTransactionsRepository(ApplicationDbContext db)
            : base(db) { }
    }
}
