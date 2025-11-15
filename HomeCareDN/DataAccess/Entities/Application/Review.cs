using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccess.Entities.Application
{
    public class Review
    {
        [Key]
        public Guid ReviewID { get; set; }

        public required string UserID { get; set; }
        public Guid? ServiceRequestID { get; set; }
        public Guid? MaterialRequestID { get; set; }
        public required string PartnerID { get; set; }

        [MinLength(1), MaxLength(5)]
        public int Rating { get; set; } = 1;
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Image>? Images { get; set; }

        [ForeignKey("ServiceRequestID")]
        public ServiceRequest? ServiceRequest { get; set; }

        [ForeignKey("MaterialRequestID")]
        public MaterialRequest? MaterialRequest { get; set; }
    }
}
