using DataAccess.Data;
using DataAccess.Repositories;
using DataAccess.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;
using WebApi.Repositories;

namespace DataAccess.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _configuration;
        public IImageRepository ImageRepository { get; private set; }
        public IServiceRequestRepository ServiceRequestRepository { get; private set; }
        public IMaterialRepository MaterialRepository { get; private set; }
        public ICartItemRepository CartItemRepository { get; }
        public ICartRepository CartRepository { get; }
        public IServiceRepository ServiceRepository { get; private set; }
        public IContractorApplicationRepository ContractorApplicationRepository
        {
            get;
            private set;
        }

        public UnitOfWork(ApplicationDbContext db, IConfiguration configuration)
        {
            _db = db;
            _configuration = configuration;
            ImageRepository = new ImageRepository(_db, _configuration);
            ServiceRequestRepository = new ServiceRequestRepository(_db);
            MaterialRepository = new MaterialRepository(_db);
            CartItemRepository = new CartItemRepository(_db);
            CartRepository = new CartRepository(_db);
            ServiceRepository = new ServiceRepository(_db);
            ContractorApplicationRepository = new ContractorApplicationRepository(_db);
        }

        public async Task SaveAsync()
        {
            await _db.SaveChangesAsync();
        }
    }
}
