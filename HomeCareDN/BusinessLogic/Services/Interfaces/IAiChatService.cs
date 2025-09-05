using BusinessLogic.DTOs.Chat.Ai;

namespace BusinessLogic.Services.Interfaces
{
    public interface IAiChatService
    {
        Task<AiChatResponseDto> SendAsync(AiChatRequestDto request);
        Task<IEnumerable<AiChatMessageDto>> GetHistoryAsync();
        Task ClearHistoryAsync();
    }
}
