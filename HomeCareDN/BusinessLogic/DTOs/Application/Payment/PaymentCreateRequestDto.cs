namespace DataAccess.Entities.Payment
{
    public class PaymentCreateRequestDto
    {
        public required string Role { get; set; }
        public Guid? ContractorApplicationID { get; set; }
        public Guid? ServiceRequestID { get; set; }
        public Guid? DistributorApplicationID { get; set; }
        public Guid? MaterialRequestID { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public string? ItemName { get; set; }
    }
}
