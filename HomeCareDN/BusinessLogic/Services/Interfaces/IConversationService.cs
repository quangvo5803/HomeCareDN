using BusinessLogic.DTOs.Application.Chat.User;

namespace BusinessLogic.Services.Interfaces
{
    public interface IConversationService
    {
        Task<ConversationDto> StartConversationAsync(StartConversationRequestDto dto);
        Task<IEnumerable<ConversationDto>> GetMyConversationsAsync(string userId);
        Task<IEnumerable<ChatMessageDto>> GetMessagesAsync(
            Guid conversationId,
            int page = 1,
            int pageSize = 50
        );
        Task<ChatMessageDto> SendMessageAsync(string senderId, SendMessageRequestDto dto);
        Task MarkAsReadAsync(Guid conversationId, string userId);
        Task CloseConversationAsync(Guid conversationId, string userId);
    }
}
