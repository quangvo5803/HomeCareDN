using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.ContractorApplication
{
    public class ContractorGetApplicationDto
    {
        [Required]
        public Guid ServiceRequestID { get; set; }

        [Required]
        public Guid ContractorID { get; set; }
    }
}
