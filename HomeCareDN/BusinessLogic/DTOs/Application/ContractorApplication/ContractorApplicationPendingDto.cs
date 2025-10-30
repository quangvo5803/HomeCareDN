using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.ContractorApplication
{
    public class ContractorApplicationPendingDto
    {
        public Guid ContractorApplicationID { get; set; }
        public string? Description { get; set; }
        public double EstimatePrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public required string Status { get; set; }
        public ICollection<string>? ImageUrls { get; set; }
        public ICollection<string>? DocumentUrls { get; set; }

        // Thông tin đánh giá nhà thầu
        public int CompletedProjectCount { get; set; } = 0;
        public double AverageRating { get; set; } = 0;
    }
}
