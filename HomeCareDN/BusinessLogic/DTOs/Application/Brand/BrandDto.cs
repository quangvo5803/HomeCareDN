using BusinessLogic.DTOs.Application.Material;

namespace BusinessLogic.DTOs.Application.Brand
{
    public class BrandDto
    {
        public Guid BrandID { get; set; }
        public required string BrandName { get; set; }
        public string? BrandDescription { get; set; }
        public required string BrandLogo { get; set; }

        // Danh sách Material đi kèm
        public ICollection<MaterialDto>? Materials { get; set; }
    }
}
