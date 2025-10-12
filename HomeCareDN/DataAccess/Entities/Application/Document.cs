using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Document
    {
        [Key]
        public Guid DocumentID { get; set; }

        [Required]
        public required string DocumentUrl { get; set; }
        public Guid? ServiceRequestID { get; set; }
        public Guid? ContractorApplicationID { get; set; }
        public string PublicId { get; set; } = string.Empty;
    }
}
