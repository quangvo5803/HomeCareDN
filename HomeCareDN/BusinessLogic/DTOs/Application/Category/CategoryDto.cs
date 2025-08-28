using BusinessLogic.DTOs.Application.Material;

namespace BusinessLogic.DTOs.Application.Category
{
    public class CategoryDto
    {
        public Guid CategoryID { get; set; }
        public required string CategoryName { get; set; }
        public Guid? ParentCategoryID { get; set; }
        public string? ParentCategoryName { get; set; }

        // Danh sách category con
        public ICollection<CategoryDto>? SubCategories { get; set; }

        // Danh sách materials thuộc category này
        public ICollection<MaterialDto>? Materials { get; set; }
    }
}
