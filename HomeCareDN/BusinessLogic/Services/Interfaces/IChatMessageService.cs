using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Chat.User;

namespace BusinessLogic.Services.Interfaces
{
    public interface IChatMessageService
    {
        Task<ChatMessageDto> SendMessageAsync(SendMessageRequestDto dto);
        Task<PagedResultDto<ChatMessageDto>> GetAllMessagesByConversationIDAsync(
            Guid id,
            int pageNumber,
            int pageSize
        );
    }
}
