namespace DataAccess.Entities.Application
{
    public class MaterialRequestItem
    {
        public Guid MaterialRequestItemID { get; set; }
        public Guid MaterialRequestID { get; set; }
        public Guid MaterialID { get; set; }
        public int Quantity { get; set; }
    }
}
