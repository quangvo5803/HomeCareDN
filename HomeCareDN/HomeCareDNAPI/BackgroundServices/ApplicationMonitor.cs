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
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessContractorApplications(stoppingToken);
                    await ProcessDistributorApplications(stoppingToken);
                }
                catch (Exception ex)
                {
                    // TODO: add logging (file / database)
                    Console.WriteLine($"[ApplicationMonitor] Error: {ex.Message}");
                }

                await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
            }
        }

        private async Task ProcessContractorApplications(CancellationToken token)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var now = DateTime.UtcNow;

            var expiredApps = await db
                .ContractorApplications.Where(ca =>
                    ca.Status == ApplicationStatus.Pending && ca.DueCommisionTime < now
                )
                .ToListAsync(token);

            if (expiredApps.Count == 0)
                return;

            var relatedIds = expiredApps.Select(x => x.ServiceRequestID).Distinct().ToList();

            var relatedRequests = await db
                .ServiceRequests.Where(sr => relatedIds.Contains(sr.ServiceRequestID))
                .ToListAsync(token);

            var allApps = await db
                .ContractorApplications.Where(ca => relatedIds.Contains(ca.ServiceRequestID))
                .ToListAsync(token);

            foreach (var app in expiredApps)
                app.Status = ApplicationStatus.Rejected;

            foreach (var req in relatedRequests)
            {
                req.Status = RequestStatus.Opening;

                var apps = allApps.Where(a => a.ServiceRequestID == req.ServiceRequestID);

                foreach (var app in apps)
                {
                    if (app.Status == ApplicationStatus.Rejected && !expiredApps.Contains(app))
                        app.Status = ApplicationStatus.Pending;
                }
            }

            await db.SaveChangesAsync(token);
        }

        private async Task ProcessDistributorApplications(CancellationToken token)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var now = DateTime.UtcNow;

            var expiredApps = await db
                .DistributorApplications.Where(ca =>
                    ca.Status == ApplicationStatus.Pending && ca.DueCommisionTime < now
                )
                .ToListAsync(token);

            if (expiredApps.Count == 0)
                return;

            var relatedIds = expiredApps.Select(x => x.MaterialRequestID).Distinct().ToList();

            var relatedRequests = await db
                .MaterialRequests.Where(sr => relatedIds.Contains(sr.MaterialRequestID))
                .ToListAsync(token);

            var allApps = await db
                .DistributorApplications.Where(ca => relatedIds.Contains(ca.MaterialRequestID))
                .ToListAsync(token);

            foreach (var app in expiredApps)
                app.Status = ApplicationStatus.Rejected;

            foreach (var req in relatedRequests)
            {
                req.Status = RequestStatus.Opening;

                var apps = allApps.Where(a => a.MaterialRequestID == req.MaterialRequestID);

                foreach (var app in apps)
                {
                    if (app.Status == ApplicationStatus.Rejected && !expiredApps.Contains(app))
                        app.Status = ApplicationStatus.Pending;
                }
            }

            await db.SaveChangesAsync(token);
        }
    }
}
