using BusinessLogic.DTOs.Application.DistributorApplication.Items;

namespace BusinessLogic.DTOs.Application.DistributorApplication
{
    public class DistributorCreateApplicationDto
    {
        public Guid MaterialRequestID { get; set; }
        public Guid DistributorID { get; set; }
        public string? Message { get; set; }
        public double TotalEstimatePrice { get; set; }
        public List<DistributorCreateApplicationItemDto>? Items { get; set; }
    }
}
