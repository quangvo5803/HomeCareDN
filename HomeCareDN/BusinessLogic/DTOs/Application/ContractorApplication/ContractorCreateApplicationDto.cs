using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.ContractorApplication
{
    public class ContractorCreateApplicationDto
    {
        [Required(ErrorMessage = "REQUIRED_CONTRACTOR_APPLYCATION_ID")]
        public Guid ContractorApplicationID { get; set; }

        [Required(ErrorMessage = "REQUIRED_SERVICE_REQUEST_ID")]
        public Guid ServiceRequestID { get; set; }

        [Required(ErrorMessage = "REQUIRED_CONTRACTOR_ID")]
        public required Guid ContractorID { get; set; }

        [Required(ErrorMessage = "REQUIRED_CONTRACTOR_APPLY_DESCRIPTION")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "REQUIRED_ESTIMATE_PRICE")]
        public double EstimatePrice { get; set; }
        public required List<string> ImageUrls { get; set; }
        public required List<string> ImagePublicIds { get; set; }
        public required List<string> DocumentUrls { get; set; }
        public required List<string> DocumentPublicIds { get; set; }
    }
}
