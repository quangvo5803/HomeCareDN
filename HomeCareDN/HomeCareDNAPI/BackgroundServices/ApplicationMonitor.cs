using BusinessLogic.Services.Interfaces;
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
            var notifier = scope.ServiceProvider.GetRequiredService<ISignalRNotifier>();
            var now = DateTime.Now;

            // =======================================================
            // 1. CONTRACTOR APPLICATION
            // =======================================================
            var expiredContractors = await db
                .ContractorApplications.AsTracking()
                .Where(a =>
                    a.Status == ApplicationStatus.PendingCommission && a.DueCommisionTime < now && 
                    !db.PaymentTransactions.Any(p =>
                        p.ContractorApplicationID == a.ContractorApplicationID &&
                        p.Status == PaymentStatus.Pending
                    )
                )
                .ToListAsync();

            List<ServiceRequest> contractorRequests = new List<ServiceRequest>();

            if (expiredContractors.Count > 0)
            {
                Console.WriteLine($"[Contractor] Expired = {expiredContractors.Count}");

                var contractorRequestIds = expiredContractors
                    .Select(e => e.ServiceRequestID)
                    .Distinct()
                    .ToList();

                contractorRequests = await db
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
                    a.Status == ApplicationStatus.PendingCommission && a.DueCommisionTime < now &&
                    !db.PaymentTransactions.Any(p =>
                        p.DistributorApplicationID == a.DistributorApplicationID &&
                        p.Status == PaymentStatus.Pending
                    )
                )
                .ToListAsync();

            List<MaterialRequest> distributorRequests = new List<MaterialRequest>();

            if (expiredDistributors.Count > 0)
            {
                Console.WriteLine($"[Distributor] Expired = {expiredDistributors.Count}");

                var distributorRequestIds = expiredDistributors
                    .Select(e => e.MaterialRequestID)
                    .Distinct()
                    .ToList();

                distributorRequests = await db
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
            // SAVE ALL & NOTIFY
            // =======================================================
            if (expiredContractors.Count > 0 || expiredDistributors.Count > 0)
            {
                await db.SaveChangesAsync();
                Console.WriteLine("[ApplicationMonitor] All updates DONE");

                // =======================================================
                // 3. REALTIME NOTIFICATIONS
                // =======================================================

                // 3.1 Notify Contractor Events
                foreach (var app in expiredContractors)
                {
                    var req = contractorRequests.FirstOrDefault(r =>
                        r.ServiceRequestID == app.ServiceRequestID
                    );
                    if (req != null)
                    {
                        var payload = new
                        {
                            serviceRequestID = app.ServiceRequestID,
                            contractorApplicationID = app.ContractorApplicationID,
                            status = ApplicationStatus.Rejected.ToString(),
                            reason = "Commission payment expired",
                        };

                        // Notify Customer
                        await notifier.SendToApplicationGroupAsync(
                            $"user_{req.CustomerID}",
                            "ContractorApplication.Rejected",
                            payload
                        );

                        // Notify Contractor
                        await notifier.SendToApplicationGroupAsync(
                            "role_Contractor",
                            "ContractorApplication.Rejected",
                            payload
                        );

                        // Notify Admin
                        await notifier.SendToApplicationGroupAsync(
                            "role_Admin",
                            "ContractorApplication.Rejected",
                            payload
                        );
                    }
                }

                // 3.2 Notify Distributor Events
                foreach (var app in expiredDistributors)
                {
                    var req = distributorRequests.FirstOrDefault(r =>
                        r.MaterialRequestID == app.MaterialRequestID
                    );
                    if (req != null)
                    {
                        var payload = new
                        {
                            materialRequestID = app.MaterialRequestID,
                            distributorApplicationID = app.DistributorApplicationID,
                            status = ApplicationStatus.Rejected.ToString(),
                            reason = "Commission payment expired",
                        };

                        // Notify Customer
                        await notifier.SendToApplicationGroupAsync(
                            $"user_{req.CustomerID}",
                            "DistributorApplication.Rejected",
                            payload
                        );

                        // Notify Distributor
                        await notifier.SendToApplicationGroupAsync(
                            "role_Distributor",
                            "DistributorApplication.Rejected",
                            payload
                        );
                        // Notify Admin
                        await notifier.SendToApplicationGroupAsync(
                            "role_Admin",
                            "DistributorApplication.Rejected",
                            payload
                        );
                    }
                }
            }
        }
    }
}
