namespace BusinessLogic.DTOs.Application.Notification
{
    public class NotificationSystemCreateOrUpdateDto
    {
        public required string Title { get; set; }
        public required string Message { get; set; }
        public required string DataKey { get; set; }
        public required string TargetRoles { get; set; }
    }
}
