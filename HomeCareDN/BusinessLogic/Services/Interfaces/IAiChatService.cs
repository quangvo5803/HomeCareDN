using BusinessLogic.DTOs.Application.Chat.Ai;
using BusinessLogic.DTOs.Application.ServiceRequest;

namespace BusinessLogic.Services.Interfaces
{
    public interface IAiChatService
    {
        Task<AiChatResponseDto> ChatSupportAsync(AiChatRequestDto dto);
        Task<List<string>> SuggestSearchAsync(string query);
        Task<AiServiceRequestPredictionResponseDto> EstimatePriceAsync(
            AIServiceRequestPredictionRequestDto dto
        );
    }
}
