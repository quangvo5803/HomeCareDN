using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.ContractorApplication
{
    public class ContractorApplicationCreateRequestDto
    {
        [Required]
        public required string UserID { get; set; }

        [Required]
        public required Guid ServiceRequestID { get; set; }
        public string? Description { get; set; }
        public double EstimatePrice { get; set; }
        public List<IFormFile>? Images { get; set; }
    }
}
