using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess.Entities.Application
{
    public class Brand
    {
        [Key]
        public Guid BrandID { get; set; }

        [Required]
        public required string BrandName { get; set; }
        public string? BrandDescription { get; set; }

        [Required]
        public required Guid BrandLogoID { get; set; }

        public ICollection<Material>? Materials { get; set; }

        [ForeignKey("BrandLogoID")]
        public Image? LogoImage { get; set; }
    }
}
