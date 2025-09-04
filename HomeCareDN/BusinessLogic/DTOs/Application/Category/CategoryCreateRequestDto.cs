using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Category
{
    public class CategoryCreateRequestDto
    {
        [Required(ErrorMessage = "REQUIRED_CATEGORYNAME")]
        public required string CategoryName { get; set; }
        public string? CategoryNameEN { get; set; }
    }
}
