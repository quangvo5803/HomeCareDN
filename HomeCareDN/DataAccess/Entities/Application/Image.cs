using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Image
    {
        [Key]
        public Guid ImageID { get; set; }

        [Required]
        public required string ImageUrl { get; set; }
        public Guid? MaterialID { get; set; }
        public Guid? ServiceID { get; set; }
        public string PublicId { get; set; }
    }
}
