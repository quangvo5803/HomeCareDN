using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Service
    {
        [Key]
        public Guid ServiceID { get; set; }
        [Required]
        public required string Name { get; set; }
        public ServiceType ServiceType { get; set; }
        public PackageOption? PackageOption { get; set; }
        public BuildingType BuildingType { get; set; }
        public string? Description { get; set; }
        public double PriceEsstimate { get; set; }
        public ICollection<Image>? Images { get; set; } = new List<Image>();
    }
}
