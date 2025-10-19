using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.MaterialRequest
{
    public class MaterialRequestDto
    {
        public Guid MaterialRequestID { get; set; }
        public Guid CustomerID { get; set; }
        public Guid? SelectedDistributorApplicationID { get; set; }
        public required string Description { get; set; }
        public bool CanEditQuantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public required string Status { get; set; }
        public ICollection<MaterialRequestItem>? MaterialRequestItems { get; set; }
        public ICollection<DistributorApplication>? DistributorApplications { get; set; }
    }
}
