using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.ServiceRequest
{
    public class ServiceRequestUpdateRequestDto
    {
        [Required]
        public Guid ServiceRequestID { get; set; }

        [Required(ErrorMessage = "REQUIRED_SERVICE_REQUEST_ADDRESS")]
        public Guid AddressID { get; set; }

        public ServiceType? ServiceType { get; set; }

        public PackageOption? PackageOption { get; set; }

        public BuildingType? BuildingType { get; set; }

        public MainStructureType? MainStructureType { get; set; }

        public DesignStyle? DesignStyle { get; set; }

        public double? Width { get; set; }

        public double? Length { get; set; }

        public int? Floors { get; set; }

        public double? EstimatePrice { get; set; }

        public string? Description { get; set; }

        public List<string>? ImageUrls { get; set; }
        public List<string>? ImagePublicIds { get; set; }
        public List<string>? DocumentUrls { get; set; }
        public List<string>? DocumentPublicIds { get; set; }
    }
}
