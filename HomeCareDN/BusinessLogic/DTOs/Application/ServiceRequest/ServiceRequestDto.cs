namespace BusinessLogic.DTOs.Application.ServiceRequest
{
    public class ServiceRequestDto
    {
        public Guid ServiceRequestID { get; set; }

        public required string UserID { get; set; }

        public required string ServiceType { get; set; }
        public required string? PackageOption { get; set; }
        public required string BuildingType { get; set; }
        public required string MainStructureType { get; set; }
        public required string DesignStyle { get; set; }
        public double Width { get; set; }
        public double Length { get; set; }
        public int Floors { get; set; }
        public double EstimatePrice { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsOpen { get; set; }
        public ICollection<string>? ImageUrls { get; set; }
    }
}
