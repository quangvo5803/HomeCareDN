using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Service
{
    public class ServiceDto
    {
        public Guid ServiceID { get; set; }

        [Required]
        public required string Name { get; set; }
        public string? NameEN { get; set; }

        public required string ServiceType { get; set; }
        public string? PackageOption { get; set; }
        public required string BuildingType { get; set; }
        public string? MainStructureType { get; set; }
        public string? DesignStyle { get; set; }

        public string? Description { get; set; }
        public string? DescriptionEN { get; set; }
        public ICollection<string>? ImageUrls { get; set; }
        public ICollection<string>? ImagePublicIds { get; set; }
    }
}
