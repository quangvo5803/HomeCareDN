using BusinessLogic.DTOs.Application.Chat.User.Convesation;

namespace BusinessLogic.Services.Interfaces
{
    public interface IConversationService
    {
        Task<ConversationDto?> GetConversationByIDAsync(Guid id);
        Task<IEnumerable<ConversationDto>> GetAllConversationByAdminIDAsync(Guid id);
    }
}
