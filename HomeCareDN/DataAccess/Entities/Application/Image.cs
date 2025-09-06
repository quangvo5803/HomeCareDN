using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess.Entities.Application
{
    public class Image
    {
        [Key]
        public Guid ImageID { get; set; }

        [Required]
        public required string ImageUrl { get; set; }
        public Guid? MaterialID { get; set; }
        public Guid? ServiceRequestID { get; set; }
        public Guid? ServiceID { get; set; }
        public Guid? ContractorApplicationID { get; set; }
        public Guid? BrandID { get; set; }
        public string PublicId { get; set; } = string.Empty;
    }
}
