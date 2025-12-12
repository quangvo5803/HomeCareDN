namespace BusinessLogic.DTOs.Application.Chat.Ai
{
    public class AiSearchRequestDto
    {
        public string? UserID { get; set; }
        public List<string>? History { get; set; }
        public string? SearchType { get; set; }
        public string? Language { get; set; } = "vi";
    }
}
