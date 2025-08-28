using System.ComponentModel.DataAnnotations;

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

        // Quan hệ với Material
        public ICollection<Material>? Materials { get; set; }
    }
}
