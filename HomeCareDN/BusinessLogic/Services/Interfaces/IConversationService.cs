using BusinessLogic.DTOs.Application.Chat.User.Convesation;

namespace BusinessLogic.Services.Interfaces
{
    public interface IConversationService
    {
        Task<ConversationDto?> GetConversationByIDAsync(Guid id);
        Task<ConversationDto?> GetConversationByUserIDAsync(string id);
        Task<IEnumerable<ConversationDto>> GetAllConversationByAdminIDAsync(string id);
        Task MarkConversationAsReadAsync(Guid id);
    }
}
