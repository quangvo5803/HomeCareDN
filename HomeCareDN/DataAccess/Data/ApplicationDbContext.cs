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
        public DbSet<Material> Materials { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Category> Categories { get; set; }

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

            builder.Entity<Service>(entity =>
            {
                entity.Property(e => e.ServiceType).HasConversion<string>();

                entity.Property(e => e.PackageOption).HasConversion<string>();

                entity.Property(e => e.BuildingType).HasConversion<string>();
            });

            builder.Entity<Material>(entity =>
            {
                entity.Property(e => e.Brand).HasConversion<string>();
            });
            base.OnModelCreating(builder);
        }
    }
}
