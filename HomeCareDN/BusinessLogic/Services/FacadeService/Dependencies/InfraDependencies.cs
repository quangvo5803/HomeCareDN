using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Ultitity.Clients.Groqs;
using Ultitity.Email.Interface;
using Ultitity.Options;

namespace BusinessLogic.Services.FacadeService.Dependencies
{
    public class InfraDependencies
    {
        public IConfiguration Configuration { get; }
        public IEmailQueue EmailQueue { get; }
        public IDistributedCache Cache { get; }
        public IHttpContextAccessor Http { get; }
        public IGroqClient GroqClient { get; }
        public IOptions<PayOsOptions> PayOsOptions { get; }
        public ISignalRNotifier Notifier { get; }

        public InfraDependencies(
            IConfiguration configuration,
            IEmailQueue emailQueue,
            IDistributedCache cache,
            IHttpContextAccessor http,
            IGroqClient groqClient,
            IOptions<PayOsOptions> payOsOptions,
            ISignalRNotifier notifier
        )
        {
            Configuration = configuration;
            EmailQueue = emailQueue;
            Cache = cache;
            Http = http;
            GroqClient = groqClient;
            PayOsOptions = payOsOptions;
            Notifier = notifier;
        }
    }
}
