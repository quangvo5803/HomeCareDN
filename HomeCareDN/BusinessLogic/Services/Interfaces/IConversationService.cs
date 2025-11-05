using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Chat.User;

namespace BusinessLogic.Services.Interfaces
{
    public interface IConversationService
    {
        Task<ConversationDto> CreateConversationAsync(ConversationCreateRequestDto dto);
        Task<ConversationDto?> GetConversationByIdAsync(Guid id);
    }
}
