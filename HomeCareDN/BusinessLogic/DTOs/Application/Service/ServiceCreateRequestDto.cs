using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.Service
{
    public class ServiceCreateRequestDto
    {
        [Required]
        public required string Name { get; set; }

        [Required]
        public ServiceType ServiceType { get; set; }
        public PackageOption? PackageOption { get; set; }

        [Required]
        public BuildingType BuildingType { get; set; }

        public string? Description { get; set; }
        public double PriceEsstimate { get; set; }
        public List<IFormFile>? Images { get; set; }
    }
}
