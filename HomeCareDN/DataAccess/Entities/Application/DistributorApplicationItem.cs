namespace DataAccess.Entities.Application
{
    public class DistributorApplicationItem
    {
        public Guid DistributorApplicationItemID { get; set; }
        public Guid DistributorApplicationID { get; set; }
        public Guid MaterialID { get; set; }
        public double Price { get; set; }
        public int Quantity { get; set; }
    }
}
