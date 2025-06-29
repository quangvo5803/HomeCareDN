using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.Service
{
    public class ServiceCreateRequestDto
    {
        [Required]
        public required string Name { get; set; }

        [Required]
        public int ServiceType { get; set; }
        public int? PackageOption { get; set; }

        [Required]
        public int BuildingType { get; set; }

        public string? Description { get; set; }
        public double PriceEsstimate { get; set; }
        public List<IFormFile>? Images { get; set; }
    }
}
