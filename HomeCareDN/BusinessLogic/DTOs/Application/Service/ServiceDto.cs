using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Service
{
    public class ServiceDto
    {
        public Guid ServiceID { get; set; }

        [Required]
        public required string Name { get; set; }

        public required string ServiceType { get; set; }
        public string? PackageOption { get; set; }
        public required string BuildingType { get; set; }

        public string? Description { get; set; }
        public ICollection<string>? ImageUrls { get; set; }
    }
}
