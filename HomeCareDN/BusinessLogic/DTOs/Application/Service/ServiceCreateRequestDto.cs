using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.Service
{
    public class ServiceCreateRequestDto
    {
        [Required(ErrorMessage = "REQUIRED_SERVICENAME")]
        public string Name { get; set; } = null!;
        public string? NameEN { get; set; }

        [Required(ErrorMessage = "REQUIRED_SERVICETYPE")]
        public ServiceType ServiceType { get; set; }
        public PackageOption? PackageOption { get; set; }

        [Required(ErrorMessage = "REQUIRED_BUILDINGTYPE")]
        public BuildingType BuildingType { get; set; }
        public MainStructureType? MainStructureType { get; set; }
        public DesignStyle? DesignStyle { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEN { get; set; }
        public required List<string> ImageUrls { get; set; }
        public required List<string> ImagePublicIds { get; set; }
    }
}
