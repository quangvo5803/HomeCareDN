using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.DTOs.Authorize.AddressDtos;

namespace BusinessLogic.DTOs.Application.ServiceRequest
{
    public class ServiceRequestDto
    {
        public Guid ServiceRequestID { get; set; }
        public required Guid CustomerID { get; set; }
        public required Guid AddressID { get; set; }
        public required AddressDto Address { get; set; }

        public required string ServiceType { get; set; }
        public required string PackageOption { get; set; }
        public required string BuildingType { get; set; }
        public required string MainStructureType { get; set; }
        public required string DesignStyle { get; set; }

        public double Width { get; set; }
        public double Length { get; set; }
        public int Floors { get; set; }
        public double EstimatePrice { get; set; }
        public required string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsOpen { get; set; }

        public int ContractorApplyCount { get; set; }
        public ICollection<string>? ImageUrls { get; set; }
        public ICollection<string>? ImagePublicIds { get; set; }

        // Danh sách ứng tuyển khi chưa chọn nhà thầu
        public ICollection<ContractorApplicationPendingDto>? ContractorApplications { get; set; }

        // Thông tin nhà thầu đã được chọn (chỉ có 1 khi chọn)
        public ContractorApplicationFullDto? SelectedContractorApplication { get; set; }
    }
}
