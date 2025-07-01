using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class UserNotification
    {
        [Key]
        public Guid UserNotificationId { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [Required]
        public required string Title { get; set; } = null!;

        [Required]
        public required string Content { get; set; } = null!;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
