using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.ServiceRequest
{
    public class ServiceRequestCreateRequestDto
    {
        [Required]
        public required string UserID { get; set; }

        [Required]
        public required ServiceType ServiceType { get; set; }

        public required PackageOption PackageOption { get; set; }

        [Required]
        public required BuildingType BuildingType { get; set; }

        [Required]
        public required MainStructureType MainStructureType { get; set; }

        public DesignStyle? DesignStyle { get; set; }

        [Required]
        public required double Width { get; set; }

        [Required]
        public required double Length { get; set; }

        [Required]
        public required int Floors { get; set; }

        public required double? EstimatePrice { get; set; }

        public string? Description { get; set; }

        public List<string>? ImageUrls { get; set; }
        public List<string>? ImagePublicIds { get; set; }
    }
}
