using DataAccess.Entities.Application;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.MaterialRequest
{
    public class MaterialRequestUpdateMaterialRequestDto
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
        public ICollection<Image>? Images { get; set; }
    }
}
