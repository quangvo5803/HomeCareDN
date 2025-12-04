using Microsoft.AspNetCore.SignalR;

namespace HomeCareDNAPI.Hubs
{
    public class ApplicationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var userId = httpContext?.Request.Query["userId"].ToString();
            var role = httpContext?.Request.Query["role"];

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
