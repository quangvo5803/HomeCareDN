using BusinessLogic.DTOs.Application.DistributorApplication.Items;
using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.DistributorApplication
{
    public class DistributorApplicationDto
    {
        public Guid DistributorApplicationID { get; set; }
        public Guid MaterialRequestID { get; set; }
        public string? Message { get; set; }
        public double TotalEstimatePrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public required string Status { get; set; }

        // Thông tin đánh giá nhà phân phối
        public int CompletedProjectCount { get; set; }
        public double AverageRating { get; set; }

        // Thông tin liên lạc nhà phân phối (mới hiển thị khi đóng phí)
        public required string DistributorID { get; set; }
        public string DistributorName { get; set; } = string.Empty;
        public string DistributorEmail { get; set; } = string.Empty;
        public string DistributorPhone { get; set; } = string.Empty;
        public List<DistributorApplicationItemDto>? Items { get; set; }

    }
}
