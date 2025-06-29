using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.MaterialRequest
{
    public class MaterialRequestDto
    {
        public Guid MaterialID { get; set; }
        public required string UserID { get; set; }
        public required string Name { get; set; }
        public string? Unit { get; set; }
        public string? Description { get; set; }
        public double UnitPrice { get; set; }
        public ICollection<Image>? Images { get; set; }
    }
}
