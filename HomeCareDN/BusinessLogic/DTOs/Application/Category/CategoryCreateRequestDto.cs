namespace BusinessLogic.DTOs.Application.Category
{
    public class CategoryCreateRequestDto
    {
        public required string CategoryName { get; set; }
        public Guid? ParentCategoryID { get; set; }
    }
}
