using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Service
    {
        [Key]
        public Guid ServiceID { get; set; }

        [Required]
        public required string UserID { get; set; }

        [Required]
        public required string Name { get; set; }
        public string? Description { get; set; }
        public double PriceEsstimate { get; set; }
        public ICollection<Image>? Images { get; set; } = new List<Image>();
    }
}
