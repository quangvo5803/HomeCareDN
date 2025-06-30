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
        public ServiceType ServiceType { get; set; }

        public PackageOption? PackageOption { get; set; }

        [Required]
        public BuildingType BuildingType { get; set; }

        [Required]
        public MainStructureType MainStructureType { get; set; }

        public DesignStyle? DesignStyle { get; set; }

        [Required]
        public double Width { get; set; }

        [Required]
        public double Length { get; set; }

        [Required]
        public int Floors { get; set; }

        public double? EstimatePrice { get; set; }

        public string? Description { get; set; }

        public List<IFormFile>? Images { get; set; }
    }
}
