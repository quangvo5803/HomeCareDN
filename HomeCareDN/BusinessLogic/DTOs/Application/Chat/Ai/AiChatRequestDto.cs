namespace BusinessLogic.DTOs.Application.Chat.Ai
{
    public class AiChatRequestDto
    {
        public string SessionId { get; set; } = string.Empty;
        public string Prompt { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string Language { get; set; } = "vi";
        public AiContextDto? Context { get; set; }
    }
}
