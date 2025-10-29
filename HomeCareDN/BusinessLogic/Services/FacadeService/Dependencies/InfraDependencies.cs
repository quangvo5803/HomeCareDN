using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Ultitity.Clients.Groqs;
using Ultitity.Email.Interface;

namespace BusinessLogic.Services.FacadeService.Dependencies
{
    public class InfraDependencies
    {
        public IConfiguration Configuration { get; }
        public IEmailQueue EmailQueue { get; }
        public IDistributedCache Cache { get; }
        public IHttpContextAccessor Http { get; }
        public IGroqClient GroqClient { get; }
<<<<<<< HEAD
        public IOptions<PayOsOptions> PayOsOptions { get; }
        public ISignalRNotifier Notifier { get; }
=======
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2

        public InfraDependencies(
            IConfiguration configuration,
            IEmailQueue emailQueue,
            IDistributedCache cache,
            IHttpContextAccessor http,
<<<<<<< HEAD
            IGroqClient groqClient,
            IOptions<PayOsOptions> payOsOptions,
            ISignalRNotifier notifier
=======
            IGroqClient groqClient
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
        )
        {
            Configuration = configuration;
            EmailQueue = emailQueue;
            Cache = cache;
            Http = http;
            GroqClient = groqClient;
<<<<<<< HEAD
            PayOsOptions = payOsOptions;
            Notifier = notifier;
=======
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
        }
    }
}
