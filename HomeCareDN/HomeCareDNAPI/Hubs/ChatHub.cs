using System.Security.Claims;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace HomeCareDNAPI.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IUnitOfWork _unitOfWork;

        public ChatHub(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        private string CurrentUserId => Context.User!.FindFirst(ClaimTypes.NameIdentifier)!.Value;

        public async Task JoinConversation(Guid id)
        {
            var conversation = await _unitOfWork.ConversationRepository.GetAsync(c =>
                c.ConversationID == id
            );

            if (conversation == null)
                throw new HubException("CONVERSATION_NOT_FOUND");

            bool isMember = conversation.ConversationType switch
            {
                ConversationType.ServiceRequest => conversation.CustomerID == CurrentUserId
                    || conversation.ContractorID == CurrentUserId,

                ConversationType.MaterialRequest => conversation.CustomerID == CurrentUserId
                    || conversation.DistributorID == CurrentUserId,

                ConversationType.AdminSupport => conversation.UserID == CurrentUserId
                    || conversation.AdminID == CurrentUserId,

                _ => false,
            };

            if (!isMember)
                throw new HubException("PERMISSION_DENIED");

            await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation_{id}");
        }

        public Task LeaveConversation(Guid id) =>
            Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation_{id}");
    }
}
