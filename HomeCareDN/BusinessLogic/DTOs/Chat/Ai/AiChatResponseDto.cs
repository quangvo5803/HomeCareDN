namespace BusinessLogic.DTOs.Chat.Ai
{
    public class AiChatResponseDto
    {
        public string Reply { get; set; } = "";
        public IEnumerable<AiChatMessageDto> History { get; set; } = Array.Empty<AiChatMessageDto>();
    }
}
