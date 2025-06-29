using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.Material
{
    public class MaterialUpdateRequestDto
    {
        [Required]
        public Guid MaterialID { get; set; }

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
