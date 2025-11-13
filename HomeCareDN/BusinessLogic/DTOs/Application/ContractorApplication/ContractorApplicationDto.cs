using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.ContractorApplication
{
    public class ContractorApplicationDto
    {
        public Guid ContractorApplicationID { get; set; }
        public Guid ServiceRequestID { get; set; }
        public string? ServiceType { get; set; }
        public string? Description { get; set; }
        public double EstimatePrice { get; set; }
        public ICollection<string>? ImageUrls { get; set; }
        public DateTime CreatedAt { get; set; }
        public required string Status { get; set; }
        public DateTime? DueCommisionTime { get; set; }

        // Thông tin đánh giá nhà thầu
        public int CompletedProjectCount { get; set; }
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }

        // Thông tin liên lạc nhà thầu (mới hiển thị khi đóng phí)
        public required string ContractorID { get; set; }
        public string ContractorName { get; set; } = string.Empty;
        public string ContractorEmail { get; set; } = string.Empty;
        public string ContractorPhone { get; set; } = string.Empty;
    }
}
