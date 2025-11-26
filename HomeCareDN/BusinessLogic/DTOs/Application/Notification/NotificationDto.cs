using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.Notification
{
    public class NotificationDto
    {
        public Guid NotificationID { get; set; }
        public required string Type { get; set; }
        public required string Title { get; set; }
        public required string Message { get; set; }
        public string? TargetRoles { get; set; }
        public Guid? TargetUserId { get; set; }
        public bool IsRead { get; set; }
        public string? DataKey { get; set; }
        public string? DataValue { get; set; }
        public int PendingCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
