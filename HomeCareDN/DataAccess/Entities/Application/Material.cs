using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess.Entities.Application
{
    public class Material
    {
        [Key]
        public Guid MaterialID { get; set; }

        [Required]
        public required string UserID { get; set; }

        [Required]
        [MaxLength(150)]
        public required string Name { get; set; }

        // Quan hệ với Brand
        public Guid BrandID { get; set; }

        [ForeignKey("BrandID")]
        public Brand? Brand { get; set; }

        // Quan hệ với Category

        public Guid CategoryID { get; set; }

        [ForeignKey("CategoryID")]
        public Category? Category { get; set; }

        public string? Unit { get; set; }
        public string? Description { get; set; }
        public double UnitPrice { get; set; }

        public ICollection<Image>? Images { get; set; }
    }
}
