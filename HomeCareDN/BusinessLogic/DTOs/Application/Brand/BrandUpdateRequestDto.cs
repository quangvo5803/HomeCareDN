using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Brand
{
    public class BrandUpdateRequestDto
    {
        public required Guid BrandID { get; set; }

        [Required(ErrorMessage = "REQUIRED_BRANDNAME")]
        public required string BrandName { get; set; }
        public string? BrandDescription { get; set; }
        public string? BrandNameEN { get; set; }
        public string? BrandDescriptionEN { get; set; }
        public string? BrandLogoUrl { get; set; }
        public string? BrandLogoPublicId { get; set; }
    }
}
