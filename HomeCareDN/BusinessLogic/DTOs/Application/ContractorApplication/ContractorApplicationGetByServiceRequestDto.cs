using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.ContractorApplication
{
    public class ContractorApplicationGetByServiceRequestDto
    {
        [Required]
        public required Guid ServiceRequestID { get; set; }
        public string? SortBy { get; set; } = null;
        public bool? IsAscending { get; set; } = true;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
