using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Category
{
    public class CategoryUpdateRequestDto
    {
        [Required]
        public Guid CategoryID { get; set; }
        public string? CategoryName { get; set; }
    }
}
