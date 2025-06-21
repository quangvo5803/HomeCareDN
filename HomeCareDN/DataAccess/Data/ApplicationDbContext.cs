using DataAccess.Entities.Application;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Image> Images { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            // Additional model configurations can be added here
        }

        // DbSets for your entities can be added here, e.g.:
        // public DbSet<YourEntity> YourEntities { get; set; }
    }
}
