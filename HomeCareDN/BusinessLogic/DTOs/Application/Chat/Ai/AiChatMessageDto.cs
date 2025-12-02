namespace BusinessLogic.DTOs.Application.Chat.Ai
{
    public class AiChatMessageDto
    {
        public string Role { get; set; } = "user";
        public string Content { get; set; } = "";
        public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
    }
}
