using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.Service
{
    public class ServiceCreateRequestDto
    {
        [Required]
        public required string Name { get; set; }
        public string? NameEN { get; set; }

        [Required]
        public required ServiceType ServiceType { get; set; }
        public PackageOption? PackageOption { get; set; }

        [Required]
        public BuildingType BuildingType { get; set; }
        public MainStructureType? MainStructureType { get; set; }
        public DesignStyle? DesignStyle { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEN { get; set; }
        public List<IFormFile>? Images { get; set; }
    }
}
