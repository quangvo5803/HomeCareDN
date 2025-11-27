using DataAccess.Entities.Application;
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
        public DbSet<Address> Addresses { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.HasDefaultSchema("auth");
            base.OnModelCreating(builder);

            // =========================
            // Seed Roles
            // =========================
            builder
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

            // =========================
            // Seed Admin User (NEW)
            // =========================
            var hasher = new PasswordHasher<ApplicationUser>();

            var adminUser = new ApplicationUser
            {
                Id = "9570d410-e3ea-46e0-aac1-bb17dff7457f",
                FullName = "Admin",
                UserName = "homecaredn43@gmail.com",
                NormalizedUserName = "HOMECAREDN43@GMAIL.COM",
                Email = "homecaredn43@gmail.com",
                NormalizedEmail = "HOMECAREDN43@GMAIL.COM",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString(),
            };
            var contractorUser = new ApplicationUser
            {
                Id = "cba463ec-27a1-4882-8515-afd8109ae7fa",
                FullName = "Contractor",
                UserName = "homecaredncontractor@gmail.com",
                NormalizedUserName = "HOMECAREDNCONTRACTOR@GMAIL.COM",
                Email = "homecaredncontractor@gmail.com",
                NormalizedEmail = "HOMECAREDNCONTRACTOR@GMAIL.COM",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString(),
            };
            var distributorUser = new ApplicationUser
            {
                Id = "4e4386ec-e25d-464b-b2a3-ee57ecff614b",
                FullName = "Distributor",
                UserName = "homecaredndistributor@gmail.com",
                NormalizedUserName = "HOMECAREDNDISTRIBUTOR@GMAIL.COM",
                Email = "homecaredndistributor@gmail.com",
                NormalizedEmail = "HOMECAREDNDISTRIBUTOR@GMAIL.COM",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString(),
            };
            adminUser.PasswordHash = hasher.HashPassword(adminUser, "Abc123@");
            contractorUser.PasswordHash = hasher.HashPassword(contractorUser, "Abc123@");
            distributorUser.PasswordHash = hasher.HashPassword(distributorUser, "Abc123@");

            builder.Entity<ApplicationUser>().HasData(adminUser);
            builder.Entity<ApplicationUser>().HasData(contractorUser);
            builder.Entity<ApplicationUser>().HasData(distributorUser);

            // Assign Admin Role
            builder
                .Entity<IdentityUserRole<string>>()
                .HasData(
                    new IdentityUserRole<string>
                    {
                        UserId = adminUser.Id,
                        RoleId = "b8d2f939-6450-41c6-b5f2-d9bc0f1c9f94",
                    },
                    new IdentityUserRole<string>
                    {
                        UserId = contractorUser.Id,
                        RoleId = "b0e6799f-ea1b-4df1-a0c0-0dc77c4f54cc",
                    },
                    new IdentityUserRole<string>
                    {
                        UserId = distributorUser.Id,
                        RoleId = "d1aa179c-780e-4938-a169-1d18e87f4b2d",
                    }
                );

            // =========================
            // Address & Others
            // =========================
            builder.Entity<ApplicationUser>(entity =>
            {
                entity.Property(mr => mr.Gender).HasConversion<string>();
            });

            builder.Entity<Address>(e =>
            {
                e.HasKey(a => a.AddressID);
                e.Property(a => a.City).HasMaxLength(100).IsRequired();
                e.Property(a => a.District).HasMaxLength(100).IsRequired();
                e.Property(a => a.Ward).HasMaxLength(100).IsRequired();
                e.Property(a => a.Detail).HasMaxLength(255).IsRequired();

                e.HasOne(a => a.User)
                    .WithMany(u => u.Addresses)
                    .HasForeignKey(a => a.UserId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(a => new
                {
                    a.UserId,
                    a.City,
                    a.District,
                    a.Ward,
                });
            });
        }
    }
}
