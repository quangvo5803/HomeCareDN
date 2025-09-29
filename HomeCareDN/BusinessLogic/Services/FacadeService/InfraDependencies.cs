using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Ultitity.Clients.Groqs;
using Ultitity.Email.Interface;

namespace BusinessLogic.Services.FacadeService
{
    public class InfraDependencies
    {
        public IConfiguration Configuration { get; }
        public IEmailQueue EmailQueue { get; }
        public IDistributedCache Cache { get; }
        public IHttpContextAccessor Http { get; }
        public IGroqClient GroqClient { get; }

        public InfraDependencies(
            IConfiguration configuration,
            IEmailQueue emailQueue,
            IDistributedCache cache,
            IHttpContextAccessor http,
            IGroqClient groqClient
        )
        {
            Configuration = configuration;
            EmailQueue = emailQueue;
            Cache = cache;
            Http = http;
            GroqClient = groqClient;
        }
    }
}
