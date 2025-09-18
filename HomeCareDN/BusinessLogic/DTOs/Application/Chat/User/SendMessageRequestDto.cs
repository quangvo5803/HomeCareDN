namespace BusinessLogic.DTOs.Application.Chat.User
{
    public class SendMessageRequestDto
    {
        public Guid ConversationId { get; set; }
        public string ReceiverId { get; set; } = null!;
        public string Content { get; set; } = "";
    }
}
