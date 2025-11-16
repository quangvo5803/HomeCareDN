namespace BusinessLogic.DTOs.Application.DistributorApplication.Items
{
    public class DistributorCreateApplicationItemDto
    {
        public Guid MaterialID { get; set; }
        public double Price { get; set; }
        public int? Quantity { get; set; }
    }
}
