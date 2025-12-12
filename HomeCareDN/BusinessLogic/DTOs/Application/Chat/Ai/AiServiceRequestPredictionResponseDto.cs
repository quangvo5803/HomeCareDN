namespace BusinessLogic.DTOs.Application.Chat.Ai
{
    public class AiServiceRequestPredictionResponseDto
    {
        public string? SuggestedDescription { get; set; }
        public long LowEstimate { get; set; }
        public long MidEstimate { get; set; }
        public long HighEstimate { get; set; }
    }
}
