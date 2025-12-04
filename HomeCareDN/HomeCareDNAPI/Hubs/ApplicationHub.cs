using Microsoft.AspNetCore.SignalR;

namespace HomeCareDNAPI.Hubs
{
    public class ApplicationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            string? userId = httpContext?.Request.Query["userId"].FirstOrDefault();
            var role = httpContext?.Request.Query["role"].FirstOrDefault();

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            }

            if (!string.IsNullOrEmpty(role))
                await Groups.AddToGroupAsync(Context.ConnectionId, $"role_{role}");

            await base.OnConnectedAsync();
        }
    }
}
