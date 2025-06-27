using DataAccess.Entities.Application;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<ServiceRequest> ServiceRequests { get; set; }
        public DbSet<ContractorApplication> ContractorApplications { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<Service> Services { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<ServiceRequest>(entity =>
            {
                entity.Property(e => e.ServiceType).HasConversion<string>();

                entity.Property(e => e.PackageOption).HasConversion<string>();

                entity.Property(e => e.BuildingType).HasConversion<string>();

                entity.Property(e => e.MainStructureType).HasConversion<string>();

                entity.Property(e => e.DesignStyle).HasConversion<string>();
            });

            builder.Entity<ContractorApplication>(entity =>
            {
                entity.Property(e => e.Status).HasConversion<string>();
            });
            base.OnModelCreating(builder);
        }
    }
}
