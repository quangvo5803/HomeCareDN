using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.ContractorApplication
{
    public class ContractorApplicationGetByServiceRequestDto
    {
        [Required]
        public required Guid ServiceRequestID { get; set; }
    }
}
