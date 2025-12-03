using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Chat.User.ChatMessage;

namespace BusinessLogic.Services.Interfaces
{
    public interface IChatMessageService
    {
        Task<ChatMessageDto> SendMessageAsync(SendMessageRequestDto dto);
        Task<ChatMessageDto> SendMessageToAdminAsync(SendMessageRequestDto dto);
        Task<ChatMessageDto> SendMessageToUserAsync(SendMessageRequestDto dto);
        Task<PagedResultDto<ChatMessageDto>> GetAllMessagesByConversationIDAsync(
            ChatMessageGetByIdDto dto
        );
    }
}
