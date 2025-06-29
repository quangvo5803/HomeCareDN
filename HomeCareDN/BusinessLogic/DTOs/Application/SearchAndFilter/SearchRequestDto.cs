
namespace BusinessLogic.DTOs.Application.SearchAndFilter
{
    public class SearchRequestDto
    {
        public required string Keyword { get; set; }
        public string? Type { get; set; }
        public string? SortBy { get; set; } = null;
        public bool? IsAscending { get; set; } = true;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
