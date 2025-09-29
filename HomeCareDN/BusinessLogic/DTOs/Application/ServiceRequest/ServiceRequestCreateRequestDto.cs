using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.ServiceRequest
{
    public class ServiceRequestCreateRequestDto
    {
        [Required]
        public string UserID { get; set; } = null!;

        [Required(ErrorMessage = "REQUIRED_SERVICE_REQUEST_ADDRESS")]
        public Guid AddressID { get; set; }

        [Required(ErrorMessage = "REQUIRED_SERVICETYPE")]
        public ServiceType ServiceType { get; set; }

        [Required(ErrorMessage = "REQUIRED_PACKAGEOPTION")]
        public PackageOption PackageOption { get; set; }

        [Required(ErrorMessage = "REQUIRED_BUILDINGTYPE")]
        public BuildingType BuildingType { get; set; }

        [Required(ErrorMessage = "REQUIRED_STRUCTURETYPE")]
        public MainStructureType MainStructureType { get; set; }

        public DesignStyle? DesignStyle { get; set; }

        [Required(ErrorMessage = "REQUIRED_WIDTH")]
        public double Width { get; set; }

        [Required(ErrorMessage = "REQUIRED_LENGTH")]
        public double Length { get; set; }

        [Required(ErrorMessage = "REQUIRED_FLOORS")]
        public int Floors { get; set; }

        public double? EstimatePrice { get; set; }

        [Required(ErrorMessage = "REQUIRED_SERVICE_REQUEST_DESCRIPTION")]
        public string Description { get; set; } = null!;

        public List<string>? ImageUrls { get; set; }
        public List<string>? ImagePublicIds { get; set; }
    }
}
