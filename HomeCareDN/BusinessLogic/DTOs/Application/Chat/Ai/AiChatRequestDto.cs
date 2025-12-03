namespace BusinessLogic.DTOs.Application.Chat.Ai
{
    public class AiChatRequestDto
    {
        public string SessionId { get; set; } = string.Empty;
        public string Prompt { get; set; } = null!;
        public string? System { get; set; }
    }
}
