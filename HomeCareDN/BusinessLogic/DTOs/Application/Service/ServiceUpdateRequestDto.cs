using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.Service
{
    public class ServiceUpdateRequestDto
    {
        [Required]
        public required Guid ServiceID { get; set; }

        public string? Name { get; set; }
        public string? NameEN { get; set; }

        public ServiceType? ServiceType { get; set; }
        public PackageOption? PackageOption { get; set; }

        public BuildingType? BuildingType { get; set; }
        public MainStructureType? MainStructureType { get; set; }
        public DesignStyle? DesignStyle { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEN { get; set; }

        public List<IFormFile>? Images { get; set; }
    }
}
