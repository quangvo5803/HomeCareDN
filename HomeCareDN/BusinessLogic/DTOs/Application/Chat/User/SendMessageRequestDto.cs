using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Chat.User
{
    public class SendMessageRequestDto
    {
        [Required]
        public Guid ConversationID { get; set; }

        public string SenderID { get; set; } = string.Empty;
        public string ReceiverID { get; set; } = string.Empty;

        [Required, MinLength(1), MaxLength(8000)]
        public string Content { get; set; } = string.Empty;
    }
}
