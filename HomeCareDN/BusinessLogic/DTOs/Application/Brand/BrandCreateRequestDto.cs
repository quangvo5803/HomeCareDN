using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.Brand
{
    public class BrandCreateRequestDto
    {
        [Required(ErrorMessage = "REQUIRED_BRANDNAME")]
        public required string BrandName { get; set; }
        public string? BrandDescription { get; set; }

        [Required(ErrorMessage = "REQUIRED_BRANDLOGO")]
        public required IFormFile LogoFile { get; set; }
    }
}
