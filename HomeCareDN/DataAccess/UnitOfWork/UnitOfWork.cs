using DataAccess.Data;
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

        public UnitOfWork(ApplicationDbContext db, IConfiguration configuration)
        {
            _db = db;
            _configuration = configuration;
            ImageRepository = new ImageRepository(_db, _configuration);
        }

        public async Task SaveAsync()
        {
            await _db.SaveChangesAsync();
        }
    }
}
