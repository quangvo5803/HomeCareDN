using System.ComponentModel.DataAnnotations;
using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.Material
{
    public class MaterialUpdateRequestDto
    {
        [Required]
        public Guid MaterialID { get; set; }
        public Guid? CategoryID { get; set; }
        public string? Name { get; set; }
        public string? NameEN { get; set; }
        public Guid? BrandID { get; set; }

        public string? Unit { get; set; }
        public string? UnitEN { get; set; }

        public string? Description { get; set; }
        public string? DescriptionEN {  get; set; }
        public double? UnitPrice { get; set; }
        public List<IFormFile>? Images { get; set; }
    }
}
