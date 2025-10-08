using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess.Entities.Application
{
    public class Brand
    {
        [Key]
        public Guid BrandID { get; set; }

        //VI
        [Required]
        public required string BrandName { get; set; }
        public string? BrandDescription { get; set; }
        public Guid? BrandLogoID { get; set; }

        //EN
        public string? BrandNameEN { get; set; }
        public string? BrandDescriptionEN { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Material>? Materials { get; set; }

        [ForeignKey("BrandLogoID")]
        public Image? LogoImage { get; set; }
    }
}
