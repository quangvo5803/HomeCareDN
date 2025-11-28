namespace BusinessLogic.DTOs.Application.Notification
{
    public class NotificationSystemCreateOrUpdateDto
    {
        public required string Title { get; set; }
        public required string Message { get; set; }
        public string? DataKey { get; set; }
        public string? DataValue { get; set; }
        public required string TargetRoles { get; set; }
        public Guid? TargetUserId { get; set; }
        public Guid? SenderUserId { get; set; }
    }
}
