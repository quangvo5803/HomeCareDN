using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class SearchHistory
    {
        [Key]
        public Guid SearchHistoryID { get; set; } = Guid.NewGuid();
        public string? UserID { get; set; }
        public string SearchTerm { get; set; } = string.Empty;
        public DateTime SearchDate { get; set; } = DateTime.UtcNow;
    }
}
