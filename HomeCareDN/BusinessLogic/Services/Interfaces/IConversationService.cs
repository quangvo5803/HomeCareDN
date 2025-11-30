using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Chat.User.Convesation;

namespace BusinessLogic.Services.Interfaces
{
    public interface IConversationService
    {
        Task<ConversationDto?> GetConversationByIDAsync(ConversationGetByIdDto dto);
        Task<ConversationDto?> GetConversationByUserIDAsync(string id);
        Task<PagedResultDto<ConversationDto>> GetAllConversationByAdminIDAsync(
            ConversationGetByAdminIdDto dto
        );
        Task MarkConversationAsReadAsync(Guid id);
        Task<int> CountUnreadConversationsByAdminIDAsync(string id);
    }
}
