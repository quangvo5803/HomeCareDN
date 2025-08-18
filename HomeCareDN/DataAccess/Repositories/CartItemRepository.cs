using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;

namespace DataAccess.Repositories
{
    internal class CartItemRepository : Repository<CartItem>, ICartItemRepository
    {
        private readonly ApplicationDbContext _db;
        public CartItemRepository(ApplicationDbContext db)
            : base(db)
        {
            _db = db;
        }
    }
}

