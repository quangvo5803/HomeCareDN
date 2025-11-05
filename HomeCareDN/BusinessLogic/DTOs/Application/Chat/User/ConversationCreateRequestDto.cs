using System.ComponentModel.DataAnnotations;

namespace BusinessLogic.DTOs.Application.Chat.User
{
    public class ConversationCreateRequestDto
    {
        [Required]
        public Guid ServiceRequestID { get; set; }

        [Required]
        public Guid ContractorApplicationID { get; set; }
    }
}
