using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Chat.User.Convesation;

namespace BusinessLogic.Services.Interfaces
{
    public interface IConversationService
    {
        Task<ConversationDto?> GetConversationByIDAsync(Guid id);
        Task<ConversationDto?> GetConversationByUserIDAsync(string id);
        Task<PagedResultDto<ConversationDto>> GetAllConversationByAdminIDAsync(
            ConversationGetByIdDto dto
        );
        Task MarkConversationAsReadAsync(Guid id);
        Task<int> CountUnreadConversationsByAdminIDAsync(string id);
    }
}
