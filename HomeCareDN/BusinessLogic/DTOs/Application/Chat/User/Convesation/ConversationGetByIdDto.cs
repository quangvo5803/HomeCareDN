using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Chat.User.Convesation
{
    public class ConversationGetByIdDto
    {
        public required string AdminID { get; set; }

        [Required]
        public int ConversationNumber { get; set; } = 1;

        [Required]
        public int ConversationSize { get; set; } = 10;
        public string? Search { get; set; }
    }
}
