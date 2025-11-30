using BusinessLogic.DTOs.Application.Chat.Ai;

namespace BusinessLogic.Services.Interfaces
{
    public interface IAiChatService
    {
        Task<AiChatResponseDto> ChatSupportAsync(AiChatRequestDto dto);
        Task<List<string>> SuggestSearchAsync(string query);
        Task<string> EstimatePriceAsync(AiEstimateRequestDto dto);
    }
}
