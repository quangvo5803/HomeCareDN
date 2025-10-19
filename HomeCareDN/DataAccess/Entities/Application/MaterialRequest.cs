namespace DataAccess.Entities.Application
{
    public class MaterialRequest
    {
        public Guid MaterialRequestID { get; set; }
        public Guid CustomerID { get; set; }
        public Guid? SelectedDistributorApplicationID { get; set; }
        public required string Description { get; set; }
        public bool IsOpen { get; set; } = true;
        public bool CanEditQuantity { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
