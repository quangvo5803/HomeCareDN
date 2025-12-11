using BusinessLogic.DTOs.Application.Chat.Ai;

namespace BusinessLogic.DTOs.Application.SearchHistory
{
    public class SearchHistoryDto
    {
        public Guid SearchHistoryID { get; set; }
        public string? UserID { get; set; }
        public string? SearchTerm { get; set; }
        public DateTime SearchDate { get; set; }
    }
}
