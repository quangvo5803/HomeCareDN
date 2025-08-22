namespace BusinessLogic.DTOs.Application.Material
{
    public class MaterialDto
    {
        public Guid MaterialID { get; set; }
        public required string UserID { get; set; }
        public required string CategoryID { get; set; }
        public required string Name { get; set; }
        
        public required string Brand { get; set; }
        public string? Unit { get; set; }
        public string? Description { get; set; }
        public double UnitPrice { get; set; }
        public ICollection<string>? ImageUrls { get; set; }
    }
}
