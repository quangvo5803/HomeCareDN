using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.Category
{
    public class CategoryUpdateRequestDto
    {
        [Required]
        public Guid CategoryID { get; set; }
        public string? CategoryName { get; set; }
        public string? CategoryNameEN { get; set; }
        public bool IsActive { get; set; }
        public string? CategoryLogoUrl { get; set; }
        public string? CategoryLogoPublicId { get; set; }
    }
}
