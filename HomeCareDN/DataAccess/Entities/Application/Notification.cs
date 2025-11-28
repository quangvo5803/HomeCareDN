using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Notification
    {
        [Key]
        public Guid NotificationID { get; set; } = Guid.NewGuid();
        public NotificationType Type { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? TargetRoles { get; set; }
        public Guid? TargetUserId { get; set; }
        public Guid? SenderUserId { get; set; } // cho admin send notify
        public bool IsRead { get; set; } = false;
        public string? DataKey { get; set; }
        public string? DataValue { get; set; }
        public int PendingCount { get; set; } = 1;
        public NotificationAction Action { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum NotificationType
    {
        [Display(Name = "System")]
        System,

        [Display(Name = "Personal")]
        Personal
    }
    public enum NotificationAction
    {
        [Display(Name = "Apply")]
        Apply,

        [Display(Name = "Accept")]
        Accept,

        [Display(Name = "Reject")]
        Reject,

        [Display(Name = "Paid")]
        Paid,

        [Display(Name = "Send")]
        Send
    }
}
