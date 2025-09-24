namespace BusinessLogic.DTOs.Application
{
    public class QueryParameters
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 12;

        // mở rộng
        public Guid? FilterID { get; set; }
        public string? FilterService { get; set; }
        public Guid? FilterCategoryID { get; set; }
        public Guid? FilterBrandID { get; set; }
        public bool? FilterBool { get; set; }
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public bool SortDescending { get; set; } = false;
    }
}
