namespace BusinessLogic.DTOs.Application.DistributorApplication.Items
{
    public class DistributorApplicationItemDto
    {
        public Guid DistributorApplicationItemID { get; set; }
        public Guid MaterialID { get; set; }
        public double Price { get; set; }
        public int Quantity { get; set; }

        //Material
        public string Name { get; set; } = string.Empty;
        public string NameEN { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public string UnitEN { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public string BrandNameEN { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryNameEN { get; set; } = string.Empty;
        public List<string> ImageUrls { get; set; } = new();
    }
}
