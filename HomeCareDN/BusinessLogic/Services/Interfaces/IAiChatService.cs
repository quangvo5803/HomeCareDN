using BusinessLogic.DTOs.Application.Chat.Ai;

namespace BusinessLogic.Services.Interfaces
{
    public interface IAiChatService
    {
        Task<AiChatResponseDto> ChatSupportAsync(string message);
        Task<List<string>> SuggestSearchAsync(string query);
        Task<string> EstimatePriceAsync(AiEstimateRequestDto dto);
    }
}
