using BusinessLogic.DTOs.Application.Material;

namespace BusinessLogic.DTOs.Application.Category
{
    public class CategoryDto
    {
        public Guid CategoryID { get; set; }
        public required string CategoryName { get; set; }
        public string? CategoryNameEN { get; set; }
        public required string CategoryLogo { get; set; }
        public required Guid UserID { get; set; }
        public bool IsActive { get; set; }

        // Danh sách materials thuộc category này
        public ICollection<MaterialDto>? Materials { get; set; }
    }
}
