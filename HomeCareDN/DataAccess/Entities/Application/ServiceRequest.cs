using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class ServiceRequest
    {
        [Key]
        public Guid ServiceRequestID { get; set; }
        public required string UserID { get; set; }
        public ServiceType ServiceType { get; set; }
        public PackageOption? PackageOption { get; set; }
        public BuildingType BuildingType { get; set; }
        public MainStructureType MainStructureType { get; set; }
        public DesignStyle? DesignStyle { get; set; }
        public double Width { get; set; }
        public double Length { get; set; }
        public int Floors { get; set; }
        public double? EstimatePrice { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsOpen { get; set; } = true;
        public ICollection<Image>? Images { get; set; } // Hình ảnh mô tả yêu cầu dịch vụ
        public ICollection<ContractorApplication>? ContractorApplications { get; set; } // Ứng dụng nhà thầu liên quan đến yêu cầu dịch vụ
    }
}
