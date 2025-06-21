using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Notification
    {
        [Key]
        public Guid NotificationID { get; set; }

        [Required]
        public required string Title { get; set; }

        [Required]
        public required string Message { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
