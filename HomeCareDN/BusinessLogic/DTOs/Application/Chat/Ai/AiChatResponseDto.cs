namespace BusinessLogic.DTOs.Application.Chat.Ai
{
    public class AiChatResponseDto
    {
        public string Reply { get; set; } = "";
        public IEnumerable<AiChatMessageDto> History { get; set; } =
            Array.Empty<AiChatMessageDto>();
    }
}
