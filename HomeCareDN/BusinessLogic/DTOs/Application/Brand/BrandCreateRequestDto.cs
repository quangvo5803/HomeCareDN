using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.Brand
{
    public class BrandCreateRequestDto
    {
        [Required(ErrorMessage = "REQUIRED_BRANDNAME")]
        public string BrandName { get; set; } = null!;
        public string? BrandDescription { get; set; }
        public string? BrandNameEN { get; set; }
        public string? BrandDescriptionEN { get; set; }

        [Required(ErrorMessage = "REQUIRED_BRANDLOGO")]
        public string BrandLogoUrl { get; set; } = null!;
        public string BrandLogoPublicId { get; set; } = null!;
    }
}
