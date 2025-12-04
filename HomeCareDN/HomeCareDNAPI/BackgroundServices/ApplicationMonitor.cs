using DataAccess.Data;
using DataAccess.Entities.Application;
using Microsoft.EntityFrameworkCore;

namespace HomeCareDNAPI.BackgroundServices
{
    public class ApplicationMonitor : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public ApplicationMonitor(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("BackgroundService RUNNING...");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessApplications();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ApplicationMonitor] ERROR: {ex}");
                }

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        // =======================================================
        // GỘP CONTRACTOR + DISTRIBUTOR CHUNG 1 HÀM
        // =======================================================
        private async Task ProcessApplications()
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var now = DateTime.Now;

            // =======================================================
            // 1. CONTRACTOR APPLICATION
            // =======================================================
            var expiredContractors = await db
                .ContractorApplications.AsTracking()
                .Where(a =>
                    a.Status == ApplicationStatus.PendingCommission && a.DueCommisionTime < now
                )
                .ToListAsync();

            if (expiredContractors.Count > 0)
            {
                Console.WriteLine($"[Contractor] Expired = {expiredContractors.Count}");

                var contractorRequestIds = expiredContractors
                    .Select(e => e.ServiceRequestID)
                    .Distinct()
                    .ToList();

                var contractorRequests = await db
                    .ServiceRequests.AsTracking()
                    .Where(r => contractorRequestIds.Contains(r.ServiceRequestID))
                    .ToListAsync();

                var contractorAllApps = await db
                    .ContractorApplications.AsTracking()
                    .Where(a => contractorRequestIds.Contains(a.ServiceRequestID))
                    .ToListAsync();

                // 1.1 Mark expired → Rejected
                foreach (var app in expiredContractors)
                    app.Status = ApplicationStatus.Rejected;

                // 1.2 Re-open request + restore các ứng dụng khác → Pending
                foreach (var req in contractorRequests)
                {
                    req.Status = RequestStatus.Opening;
                    req.SelectedContractorApplicationID = null;
                    req.SelectedContractorApplication = null;
                    var apps = contractorAllApps.Where(a =>
                        a.ServiceRequestID == req.ServiceRequestID
                    );

                    foreach (var app in apps)
                    {
                        bool isExpired = expiredContractors.Any(e =>
                            e.ContractorApplicationID == app.ContractorApplicationID
                        );

                        if (!isExpired && app.Status == ApplicationStatus.Rejected)
                            app.Status = ApplicationStatus.Pending;
                    }
                }
            }

            // =======================================================
            // 2. DISTRIBUTOR APPLICATION
            // =======================================================
            var expiredDistributors = await db
                .DistributorApplications.AsTracking()
                .Where(a =>
                    a.Status == ApplicationStatus.PendingCommission && a.DueCommisionTime < now
                )
                .ToListAsync();

            if (expiredDistributors.Count > 0)
            {
                Console.WriteLine($"[Distributor] Expired = {expiredDistributors.Count}");

                var distributorRequestIds = expiredDistributors
                    .Select(e => e.MaterialRequestID)
                    .Distinct()
                    .ToList();

                var distributorRequests = await db
                    .MaterialRequests.AsTracking()
                    .Where(r => distributorRequestIds.Contains(r.MaterialRequestID))
                    .ToListAsync();

                var distributorAllApps = await db
                    .DistributorApplications.AsTracking()
                    .Where(a => distributorRequestIds.Contains(a.MaterialRequestID))
                    .ToListAsync();

                // 2.1 Mark expired → Rejected
                foreach (var app in expiredDistributors)
                    app.Status = ApplicationStatus.Rejected;

                // 2.2 Re-open + restore Pending
                foreach (var req in distributorRequests)
                {
                    req.Status = RequestStatus.Opening;
                    req.SelectedDistributorApplication = null;
                    req.SelectedDistributorApplicationID = null;
                    var apps = distributorAllApps.Where(a =>
                        a.MaterialRequestID == req.MaterialRequestID
                    );

                    foreach (var app in apps)
                    {
                        bool isExpired = expiredDistributors.Any(e =>
                            e.DistributorApplicationID == app.DistributorApplicationID
                        );

                        if (!isExpired && app.Status == ApplicationStatus.Rejected)
                            app.Status = ApplicationStatus.Pending;
                    }
                }
            }

            // =======================================================
            // SAVE ALL
            // =======================================================
            await db.SaveChangesAsync();
            Console.WriteLine("[ApplicationMonitor] All updates DONE");
        }
    }
}
