using DataAccess.Data;
using DataAccess.Entities.Application;
using Microsoft.EntityFrameworkCore;

namespace HomeCareDNAPI.BackgroundServices
{
    public class DistributorApplicationMonitor : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public DistributorApplicationMonitor(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await CheckExpiredApplications();
                await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
            }
        }

        private async Task CheckExpiredApplications()
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var now = DateTime.UtcNow;

            var expiredApps = await db
                .DistributorApplications.Where(ca =>
                    ca.Status == ApplicationStatus.Pending && ca.DueCommisionTime < now
                )
                .ToListAsync();

            if (expiredApps.Count == 0)
                return;

            var relatedRequestIds = expiredApps
                .Select(x => x.MaterialRequestID)
                .Distinct()
                .ToList();

            var relatedRequests = await db
                .MaterialRequests.Where(sr => relatedRequestIds.Contains(sr.MaterialRequestID))
                .ToListAsync();

            var allAppsOfRequests = await db
                .DistributorApplications.Where(ca =>
                    relatedRequestIds.Contains(ca.MaterialRequestID)
                )
                .ToListAsync();

            foreach (var app in expiredApps)
            {
                app.Status = ApplicationStatus.Rejected;
            }

            foreach (var req in relatedRequests)
            {
                req.Status = RequestStatus.Opening;

                var apps = allAppsOfRequests
                    .Where(a => a.MaterialRequestID == req.MaterialRequestID)
                    .ToList();

                foreach (var app in apps)
                {
                    if (app.Status == ApplicationStatus.Rejected && !expiredApps.Contains(app))
                    {
                        app.Status = ApplicationStatus.Pending;
                    }
                }
            }

            await db.SaveChangesAsync();
        }
    }
}
