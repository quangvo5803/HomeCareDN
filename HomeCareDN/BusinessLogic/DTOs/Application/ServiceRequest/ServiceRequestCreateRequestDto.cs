using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.ServiceRequest
{
    public class ServiceRequestCreateRequestDto
    {
        [Required]
        public string UserID { get; set; } = string.Empty;

        [Required]
        public int ServiceType { get; set; }

        public int? PackageOption { get; set; }

        [Required]
        public int BuildingType { get; set; }

        [Required]
        public int MainStructureType { get; set; }

        [Required]
        public int DesignStyle { get; set; }

        [Required]
        public double Width { get; set; }

        [Required]
        public double Length { get; set; }

        [Required]
        public int Floors { get; set; }

        [Required]
        public double EstimatePrice { get; set; }

        public string? Description { get; set; }

        public List<IFormFile>? Images { get; set; }
    }
}
