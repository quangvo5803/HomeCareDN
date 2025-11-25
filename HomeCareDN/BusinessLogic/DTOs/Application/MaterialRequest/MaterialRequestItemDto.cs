using BusinessLogic.DTOs.Application.Material;

namespace BusinessLogic.DTOs.Application.MaterialRequest
{
    public class MaterialRequestItemDto
    {
        public Guid MaterialRequestItemID { get; set; }
        public Guid MaterialRequestID { get; set; }
        public Guid MaterialID { get; set; }
        public int Quantity { get; set; }
        public MaterialDto? Material { get; set; }
    }
}
