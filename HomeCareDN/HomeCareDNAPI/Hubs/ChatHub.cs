using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.SignalR;

namespace HomeCareDNAPI.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IUnitOfWork _unitOfWork;

        public ChatHub(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task JoinConversation(Guid id)
        {
            var httpContext = Context.GetHttpContext();
            var userId = httpContext?.Request.Query["userId"].ToString();

            // Validate membership
            var conversation = await _unitOfWork.ConversationRepository.GetAsync(c =>
                c.ConversationID == id
            );

            if (conversation == null)
                throw new HubException("CONVERSATION_NOT_FOUND");

            bool isMember = false;

            if (conversation.ConversationType == ConversationType.ServiceRequest)
            {
                isMember = conversation.CustomerID == userId || conversation.ContractorID == userId;
            }
            else if (conversation.ConversationType == ConversationType.MaterialRequest)
            {
                isMember =
                    conversation.CustomerID == userId || conversation.DistributorID == userId;
            }
            else if (conversation.ConversationType == ConversationType.AdminSupport)
            {
                isMember = conversation.UserID == userId || conversation.AdminID == userId;
            }

            if (!isMember)
                throw new HubException("PERMISSION_DENIED");

            await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation_{id}");
        }

        public async Task LeaveConversation(Guid id)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation_{id}");
        }

        public async Task JoinAdminGroup(string id)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"admin_{id}");
        }

        public async Task LeaveAdminGroup(string id)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"admin_{id}");
        }

        public async Task JoinUserGroup(string id)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{id}");
        }

        public async Task LeaveUserGroup(string id)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{id}");
        }
    }
}
