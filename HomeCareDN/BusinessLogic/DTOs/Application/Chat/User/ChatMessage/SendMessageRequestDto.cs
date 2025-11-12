using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Chat.User.ChatMessage
{
    public class SendMessageRequestDto
    {
        public Guid? ConversationID { get; set; }

        [Required]
        public Guid SenderID { get; set; }

        [Required]
        public Guid ReceiverID { get; set; }

        [Required, MinLength(1), MaxLength(8000)]
        public string Content { get; set; } = string.Empty;
    }
}
