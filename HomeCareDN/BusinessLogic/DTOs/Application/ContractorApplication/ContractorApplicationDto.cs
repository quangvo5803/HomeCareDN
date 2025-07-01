namespace BusinessLogic.DTOs.Application.ContractorApplication
{
    public class ContractorApplicationDto
    {
        public Guid ContractorApplicationID { get; set; }
        public required Guid ServiceRequestID { get; set; }
        public required string UserID { get; set; }
        public string? Description { get; set; }
        public double EstimatePrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Status { get; set; }
        public ICollection<string>? ImageUrls { get; set; }
    }
}
