namespace BusinessLogic.DTOs.Chat.Ai
{
    public class AiChatRequestDto
    {
        public string Prompt { get; set; } = null!;
        public string? System { get; set; }
    }
}
