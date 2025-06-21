using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Review
    {
        [Key]
        public int ReviewID { get; set; }

        [Required]
        public required string UserID { get; set; }
        public Guid? MaterialID { get; set; }
        public Guid? ServiceID { get; set; }

        [MinLength(1), MaxLength(5)]
        public int Rating { get; set; } = 1;
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Image>? Images { get; set; }
    }
}
