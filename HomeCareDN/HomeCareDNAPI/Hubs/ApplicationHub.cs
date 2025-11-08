using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.SignalR;

namespace HomeCareDNAPI.Hubs
{
    public class ApplicationHub : Hub
    {
        private readonly IUnitOfWork _uow;

        public ApplicationHub(IUnitOfWork uow)
        {
            _uow = uow;
        }

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

            await base.OnConnectedAsync();
        }

        public async Task JoinConversation(Guid conversationId)
        {
            // ✅ FIX: Lấy userId từ query string thay vì claims
            var httpContext = Context.GetHttpContext();
            var userId = httpContext?.Request.Query["userId"].ToString();

            // Validate membership
            var conv = await _uow.ConversationRepository.GetAsync(c =>
                c.ConversationID == conversationId
            );

            if (conv == null)
                throw new HubException("CONVERSATION_NOT_FOUND");

            bool isMember =
                conv.CustomerID.ToString() == userId || conv.ContractorID.ToString() == userId;

            if (!isMember)
                throw new HubException("PERMISSION_DENIED");

            await Groups.AddToGroupAsync(Context.ConnectionId, $"conv_{conversationId}");
        }

        public async Task LeaveConversation(Guid conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conv_{conversationId}");
        }
    }
}
