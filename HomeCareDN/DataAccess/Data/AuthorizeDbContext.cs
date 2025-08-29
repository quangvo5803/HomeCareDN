using DataAccess.Entities.Authorize;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Data
{
    public class AuthorizeDbContext : IdentityDbContext<ApplicationUser>
    {
        public AuthorizeDbContext(DbContextOptions<AuthorizeDbContext> options)
            : base(options) { }

        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder
                .Entity<IdentityRole>()
                .HasData(
                    new IdentityRole
                    {
                        Id = "fdf4e70c-8bc1-4c63-b78b-0b71b3618f95",
                        Name = "Customer",
                        NormalizedName = "CUSTOMER",
                    },
                    new IdentityRole
                    {
                        Id = "b8d2f939-6450-41c6-b5f2-d9bc0f1c9f94",
                        Name = "Admin",
                        NormalizedName = "ADMIN",
                    },
                    new IdentityRole
                    {
                        Id = "b0e6799f-ea1b-4df1-a0c0-0dc77c4f54cc",
                        Name = "Contractor",
                        NormalizedName = "CONTRACTOR",
                    },
                    new IdentityRole
                    {
                        Id = "d1aa179c-780e-4938-a169-1d18e87f4b2d",
                        Name = "Distributor",
                        NormalizedName = "DISTRIBUTOR",
                    }
                );
        }
    }
}
