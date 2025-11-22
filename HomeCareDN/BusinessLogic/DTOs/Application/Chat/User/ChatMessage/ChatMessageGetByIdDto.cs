using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Chat.User.ChatMessage
{
    public class ChatMessageGetByIdDto
    {
        [Required]
        public Guid ConversationID { get; set; }

        [Required]
        public int MessageSize { get; set; } = 10;

        [Required]
        public int MessageNumber { get; set; } = 1;
    }
}
