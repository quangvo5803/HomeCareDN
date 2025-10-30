using Microsoft.AspNetCore.SignalR;

namespace HomeCareDNAPI.Hubs
{
    public class ApplicationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var userId = httpContext?.Request.Query["userId"];
            var role = httpContext?.Request.Query["role"];

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            }

            if (!string.IsNullOrEmpty(role))
                await Groups.AddToGroupAsync(Context.ConnectionId, $"role_{role}");

            Console.WriteLine($"Connected user {userId} in role {role}");

            await base.OnConnectedAsync();
        }
    }
}
