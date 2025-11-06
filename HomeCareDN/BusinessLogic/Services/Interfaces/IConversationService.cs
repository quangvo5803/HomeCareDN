using BusinessLogic.DTOs.Application.Chat.User;

namespace BusinessLogic.Services.Interfaces
{
    public interface IConversationService
    {
        Task<ConversationDto?> GetConversationByIDAsync(Guid id);
    }
}
