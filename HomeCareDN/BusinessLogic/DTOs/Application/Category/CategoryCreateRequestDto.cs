using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.Category
{
    public class CategoryCreateRequestDto
    {
        [Required(ErrorMessage = "REQUIRED_CATEGORYNAME")]
        public required string CategoryName { get; set; }
        public string? CategoryNameEN { get; set; }
        public bool IsActive { get; set; }
        public required Guid UserID { get; set; }

        [Required(ErrorMessage = "REQUIRED_CATEGORYLOGO")]
        public required string CategoryLogoUrl { get; set; }
        public required string CategoryLogoPublicId { get; set; }
    }
}
