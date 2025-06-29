using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.Material
{
    public class MaterialCreateRequestDto
    {
        [Required]
        public required string UserID { get; set; }

        [Required]
        public required string Name { get; set; }

        public string? Unit { get; set; }
        public string? Description { get; set; }
        public double UnitPrice { get; set; }
        public List<IFormFile>? Images { get; set; }
    }
}
