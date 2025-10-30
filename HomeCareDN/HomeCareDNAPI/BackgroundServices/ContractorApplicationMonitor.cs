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
            var expired = await db
                .ContractorApplications.Where(ca =>
                    ca.Status == ApplicationStatus.Pending && ca.DueCommisionTime < now
                )
                .ToListAsync();

            if (expired.Count == 0)
                return;

            foreach (var app in expired)
            {
                app.Status = ApplicationStatus.Rejected;

                var serviceRequest = await db.ServiceRequests.FirstOrDefaultAsync(sr =>
                    sr.ServiceRequestID == app.ServiceRequestID
                );

                if (serviceRequest != null && serviceRequest.Status == RequestStatus.Closed)
                {
                    bool hasApproved = await db.ContractorApplications.AnyAsync(ca =>
                        ca.ServiceRequestID == serviceRequest.ServiceRequestID
                        && ca.Status == ApplicationStatus.Approved
                    );

                    if (!hasApproved)
                    {
                        serviceRequest.Status = RequestStatus.Opening;
                    }
                }
            }

            await db.SaveChangesAsync();
        }
    }
}
