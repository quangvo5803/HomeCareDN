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

        // Có thể phân loại đa cấp (Category cha/con)
        public Guid? ParentCategoryID { get; set; }
        public Category? ParentCategory { get; set; }
        public ICollection<Category>? SubCategories { get; set; }

        // Quan hệ với Material
        public ICollection<Material>? Materials { get; set; }
    }
}
