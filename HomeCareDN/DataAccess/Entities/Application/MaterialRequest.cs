using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class MaterialRequest
    {
        public Guid MaterialRequestID { get; set; }
        public Guid CustomerID { get; set; }
        public Guid? AddressId { get; set; }
        public Guid? SelectedDistributorApplicationID { get; set; }
        public string? Description { get; set; }
        public bool CanAddMaterial { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public RequestStatus Status { get; set; } = RequestStatus.Draft;
        public ICollection<MaterialRequestItem>? MaterialRequestItems { get; set; }
        public ICollection<DistributorApplication>? DistributorApplications { get; set; }
        public DistributorApplication? SelectedDistributorApplication { get; set; }
    }

    public enum RequestStatus
    {
        [Display(Name = "Draft")]
        Draft,

        [Display(Name = "Opening")]
        Opening,

        [Display(Name = "Pending")]
        Pending,

        [Display(Name = "Closed")]
        Closed,
    }
}
