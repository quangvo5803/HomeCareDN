namespace BusinessLogic.DTOs.Application.Chat.User.Convesation
{
    public class ConversationGetByIdDto
    {
        public required Guid ConversationID { get; set; }

        public required string CurrentUserID { get; set; }
    }
}
