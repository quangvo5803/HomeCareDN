namespace DataAccess.Entities.Payment
{
    public class PaymentCreateRequestDto
    {
        public Guid ContractorApplicationID { get; set; }
        public Guid ServiceRequestID { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public string? ItemName { get; set; }
    }
}
