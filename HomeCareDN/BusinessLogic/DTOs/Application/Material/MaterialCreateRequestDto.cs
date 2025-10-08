using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Material
{
    public class MaterialCreateRequestDto
    {
        [Required]
        public string UserID { get; set; } = null!;
        public required Guid CategoryID { get; set; }

        [Required(ErrorMessage = "REQUIRED_MATERIALNAME")]
        public string Name { get; set; } = null!;
        public string? NameEN { get; set; }
        public Guid BrandID { get; set; }

        public string? Unit { get; set; }
        public string? UnitEN { get; set; }

        public string? Description { get; set; }
        public string? DescriptionEN { get; set; }
        public required List<string> ImageUrls { get; set; }
        public required List<string> ImagePublicIds { get; set; }
    }
}
