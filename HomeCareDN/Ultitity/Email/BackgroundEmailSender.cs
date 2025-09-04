using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Ultitity.Email.Interface;

namespace Ultitity.Email
{
    public class BackgroundEmailSender : BackgroundService
    {
        private readonly IEmailQueue _emailQueue;
        private readonly EmailSender _emailSender;
        private readonly ILogger<BackgroundEmailSender> _logger;

        public BackgroundEmailSender(
            IEmailQueue emailQueue,
            EmailSender emailSender,
            ILogger<BackgroundEmailSender> logger
        )
        {
            _emailQueue = emailQueue;
            _emailSender = emailSender;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Background email sender is running.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    if (_emailQueue.TryDequeue(out var emailData))
                    {
                        _logger.LogInformation("Sending email to {Email}", emailData.Email);
                        await _emailSender.SendEmailAsync(
                            emailData.Email,
                            emailData.Subject,
                            emailData.HtmlMessage
                        );
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending email in background.");
                }

                await Task.Delay(1000, stoppingToken); // Thời gian chờ giữa các lần kiểm tra hàng đợi
            }
        }
    }
}
