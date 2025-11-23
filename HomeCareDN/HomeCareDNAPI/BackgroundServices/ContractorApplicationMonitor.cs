using DataAccess.Data;
using DataAccess.Entities.Application;
using Microsoft.EntityFrameworkCore;

namespace HomeCareDNAPI.BackgroundServices
{
    public class ContractorApplicationMonitor : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public ContractorApplicationMonitor(IServiceProvider serviceProvider)
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
                .ContractorApplications.Where(ca =>
                    ca.Status == ApplicationStatus.Pending && ca.DueCommisionTime < now
                )
                .ToListAsync();

            if (expiredApps.Count == 0)
                return;

            var relatedRequestIds = expiredApps.Select(x => x.ServiceRequestID).Distinct().ToList();

            var relatedRequests = await db
                .ServiceRequests.Where(sr => relatedRequestIds.Contains(sr.ServiceRequestID))
                .ToListAsync();

            var allAppsOfRequests = await db
                .ContractorApplications.Where(ca => relatedRequestIds.Contains(ca.ServiceRequestID))
                .ToListAsync();

            foreach (var app in expiredApps)
            {
                app.Status = ApplicationStatus.Rejected;
            }

            foreach (var req in relatedRequests)
            {
                req.Status = RequestStatus.Opening;

                var apps = allAppsOfRequests
                    .Where(a => a.ServiceRequestID == req.ServiceRequestID)
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
