namespace BusinessLogic.DTOs.Application.Notification
{
    public class NotificationPersonalCreateOrUpdateDto
    {
        public Guid UserID { get; set; }
        public required string Title { get; set; }
        public required string Message { get; set; }
        public required string DataKey { get; set; }
    }
}
