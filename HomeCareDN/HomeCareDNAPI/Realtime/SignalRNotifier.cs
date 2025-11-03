using BusinessLogic.Services.Interfaces;
using HomeCareDNAPI.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace HomeCareDNAPI.Realtime
{
    public class SignalRNotifier : ISignalRNotifier
    {
        private readonly IHubContext<ApplicationHub> _hubContext;

        public SignalRNotifier(IHubContext<ApplicationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendToGroupAsync(string groupName, string eventName, object? payload)
        {
            await _hubContext.Clients.Group(groupName).SendAsync(eventName, payload);
        }

        public async Task SendToAllAsync(string eventName, object? payload)
        {
            await _hubContext.Clients.All.SendAsync(eventName, payload);
        }
    }
}
