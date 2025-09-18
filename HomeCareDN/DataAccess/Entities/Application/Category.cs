using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess.Entities.Application
{
    public class Category
    {
        [Key]
        public Guid CategoryID { get; set; }

        //VI
        [Required]
        [MaxLength(100)]
        public required string CategoryName { get; set; }

        //EN
        public string? CategoryNameEN { get; set; }
        public Guid? CategoryLogoID { get; set; }
        public bool IsActive { get; set; }
        public Guid UserID { get; set; }

        // Quan hệ với Material
        public ICollection<Material>? Materials { get; set; }

        [ForeignKey("CategoryLogoID")]
        public Image? LogoImage { get; set; }
    }
}
