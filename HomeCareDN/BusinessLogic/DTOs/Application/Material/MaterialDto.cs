using BusinessLogic.DTOs.Application.Brand;
using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.DTOs.Application.Image;

namespace BusinessLogic.DTOs.Application.Material
{
    public class MaterialDto
    {
        public Guid MaterialID { get; set; }
        public required string UserID { get; set; }

        public required string Name { get; set; }
        public required string NameEN { get; set; }

        //Category
        public required string CategoryName { get; set; }
        public string? CategoryNameEN { get; set; }

        //Brand
        public required string BrandName { get; set; }
        public string? BrandNameEN { get; set; }

        public string? Unit { get; set; }
        public string? UnitEN { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEN { get; set; }
        public double UnitPrice { get; set; }
        public ICollection<ImageDto>? Images { get; set; }
    }
}
