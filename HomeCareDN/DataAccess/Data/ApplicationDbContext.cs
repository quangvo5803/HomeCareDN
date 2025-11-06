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
        public DbSet<Document> Documents { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<Material> Materials { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ContactSupport> ContactSupports { get; set; }
        public DbSet<PartnerRequest> PartnerRequests { get; set; }
        public DbSet<MaterialRequest> MaterialRequests { get; set; }
        public DbSet<MaterialRequestItem> MaterialRequestItems { get; set; }
        public DbSet<DistributorApplication> DistributorApplications { get; set; }
        public DbSet<DistributorApplicationItem> DistributorApplicationItems { get; set; }
        public DbSet<PaymentTransaction> PaymentTransactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("app");
            modelBuilder.Entity<ServiceRequest>(entity =>
            {
                entity.Property(e => e.ServiceType).HasConversion<string>();

                entity.Property(e => e.PackageOption).HasConversion<string>();

                entity.Property(e => e.BuildingType).HasConversion<string>();

                entity.Property(e => e.MainStructureType).HasConversion<string>();

                entity.Property(e => e.DesignStyle).HasConversion<string>();
                entity.Property(e => e.Status).HasConversion<string>();
            });

            modelBuilder.Entity<ContractorApplication>(entity =>
            {
                entity.Property(e => e.Status).HasConversion<string>();
            });

            modelBuilder.Entity<Service>(entity =>
            {
                entity.Property(e => e.ServiceType).HasConversion<string>();

                entity.Property(e => e.PackageOption).HasConversion<string>();

                entity.Property(e => e.BuildingType).HasConversion<string>();
            });

            modelBuilder
                .Entity<Conversation>()
                .HasMany(c => c.Messages)
                .WithOne(m => m.Conversation!)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<PartnerRequest>(entity =>
            {
                entity.Property(p => p.PartnerRequestType).HasConversion<string>();
                entity.Property(p => p.Status).HasConversion<string>();
            });
            modelBuilder.Entity<MaterialRequest>(entity =>
            {
                entity.Property(mr => mr.Status).HasConversion<string>();
            });
            modelBuilder.Entity<PaymentTransaction>(entity =>
            {
                entity.Property(mr => mr.Status).HasConversion<string>();
            });
            // 1 ServiceRequest có nhiều ContractorApplications
            modelBuilder.Entity<ContractorApplication>()
                .HasOne(ca => ca.ServiceRequest)
                .WithMany(sr => sr.ContractorApplications)
                .HasForeignKey(ca => ca.ServiceRequestID);

            // 1 ServiceRequest có 1 SelectedContractorApplication (1-1)
            modelBuilder.Entity<ServiceRequest>()
                .HasOne(sr => sr.SelectedContractorApplication)
                .WithOne()
                .HasForeignKey<ServiceRequest>(sr => sr.SelectedContractorApplicationID);

            base.OnModelCreating(modelBuilder);
        }
    }
}
