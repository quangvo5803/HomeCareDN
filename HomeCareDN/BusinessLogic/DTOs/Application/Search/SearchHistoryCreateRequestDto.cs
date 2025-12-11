namespace BusinessLogic.DTOs.Application.SearchHistory
{
    public class SearchHistoryCreateRequestDto
    {
        public string? UserID { get; set; }
        public string SearchTerm { get; set; } = string.Empty;
    }
}
