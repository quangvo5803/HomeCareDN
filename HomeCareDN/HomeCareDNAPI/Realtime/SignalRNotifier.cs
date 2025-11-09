using BusinessLogic.Services.Interfaces;
using HomeCareDNAPI.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace HomeCareDNAPI.Realtime
{
    public class SignalRNotifier : ISignalRNotifier
    {
        private readonly IHubContext<ApplicationHub> _applicationHub;
        private readonly IHubContext<ChatHub> _chatHub;

        public SignalRNotifier(
            IHubContext<ApplicationHub> applicationHub,
            IHubContext<ChatHub> chatHub
        )
        {
            _applicationHub = applicationHub;
            _chatHub = chatHub;
        }

        // --- ApplicationHub ---
        public async Task SendToApplicationGroupAsync(
            string groupName,
            string eventName,
            object? payload
        )
        {
            await _applicationHub.Clients.Group(groupName).SendAsync(eventName, payload);
        }

        public async Task SendToAllApplicationAsync(string eventName, object? payload)
        {
            await _applicationHub.Clients.All.SendAsync(eventName, payload);
        }

        // --- ChatHub ---
        public async Task SendToChatGroupAsync(string conversationId, string eventName, object? payload)
        {
            var groupName = $"conversation_{conversationId}";
            await _chatHub.Clients.Group(groupName).SendAsync(eventName, payload);
        }

        public async Task SendToAllChatAsync(string eventName, object? payload)
        {
            await _chatHub.Clients.All.SendAsync(eventName, payload);
        }
    }
}
