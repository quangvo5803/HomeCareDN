using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.ContractorApplication
{
    public class ContractorApplicationUpdateRequestDto
    {
        public Guid ContractorApplicationID { get; set; }
        public string? Description { get; set; }
        public double EstimatePrice { get; set; }
        public List<IFormFile>? Images { get; set; }
    }
}
