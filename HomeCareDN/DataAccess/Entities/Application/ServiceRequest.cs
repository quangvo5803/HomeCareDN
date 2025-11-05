using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess.Entities.Application
{
    public class ServiceRequest
    {
        [Key]
        public Guid ServiceRequestID { get; set; }

        public required Guid CustomerID { get; set; }
        public required Guid AddressId { get; set; }

        public ServiceType ServiceType { get; set; }
        public PackageOption PackageOption { get; set; }
        public BuildingType BuildingType { get; set; }
        public MainStructureType MainStructureType { get; set; }
        public DesignStyle? DesignStyle { get; set; }

        public double Width { get; set; }
        public double Length { get; set; }
        public int Floors { get; set; } = 1;
        public double? EstimatePrice { get; set; }
        public required string Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public RequestStatus Status { get; set; } = RequestStatus.Opening;
        public Guid? SelectedContractorApplicationID { get; set; } //Nhà thầu khách hàng chọn

        [ForeignKey("SelectedContractorApplicationID")]
        public ContractorApplication? SelectedContractorApplication { get; set; }

        [ForeignKey("ConversationID")]
        public Conversation? Conversations { get; set; }
        public ICollection<Image>? Images { get; set; }
        public ICollection<Document>? Documents { get; set; }
        public ICollection<ContractorApplication>? ContractorApplications { get; set; }
    }
}
