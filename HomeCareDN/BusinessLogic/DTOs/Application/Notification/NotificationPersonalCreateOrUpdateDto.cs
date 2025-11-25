using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.Notification
{
    public class NotificationPersonalCreateOrUpdateDto
    {
        public Guid TargetUserId { get; set; }
        public required string Title { get; set; }
        public required string Message { get; set; }
        public required string DataKey { get; set; }
        public NotificationAction Action { get; set; }
    }
}
