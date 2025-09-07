using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.Material
{
    public class MaterialCreateRequestDto
    {
        [Required]
        public required string UserID { get; set; }
        public required Guid CategoryID { get; set; }

        [Required]
        public required string Name { get; set; }
        public string? NameEN { get; set; }
        public Guid BrandId { get; set; }

        public string? Unit { get; set; }
        public string? UnitEN { get; set; }

        public string? Description { get; set; }
        public string? DescriptionEN { get; set; }

        [Required]
        public required double UnitPrice { get; set; }
        public List<IFormFile>? Images { get; set; }
    }
}
