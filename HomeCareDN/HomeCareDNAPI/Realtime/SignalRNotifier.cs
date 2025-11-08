using BusinessLogic.Services.Interfaces;
using HomeCareDNAPI.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace HomeCareDNAPI.Realtime
{
    public class SignalRNotifier : ISignalRNotifier
    {
        private readonly IHubContext<ApplicationHub> _hubContext;
        private readonly IHubContext<ChatHub> _chatHubContext;

        public SignalRNotifier(
            IHubContext<ApplicationHub> hubContext,
            IHubContext<ChatHub> chatHubContext
        )
        {
            _hubContext = hubContext;
            _chatHubContext = chatHubContext;
        }

        public async Task SendToGroupAsync(string groupName, string eventName, object? payload)
        {
            if (groupName.StartsWith("conversation_"))
            {
                await _chatHubContext.Clients.Group(groupName).SendAsync(eventName, payload);
            }
            else
            {
                await _hubContext.Clients.Group(groupName).SendAsync(eventName, payload);
            }
        }

        public async Task SendToAllAsync(string eventName, object? payload)
        {
            await _hubContext.Clients.All.SendAsync(eventName, payload);
            await _chatHubContext.Clients.All.SendAsync(eventName, payload);
        }
    }
}
