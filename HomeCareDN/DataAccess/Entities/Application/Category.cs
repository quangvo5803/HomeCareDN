using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Category
    {
        [Key]
        public Guid CategoryID { get; set; }

        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; } = null!;

        // Quan hệ với Material
        public ICollection<Material>? Materials { get; set; }
    }
}
