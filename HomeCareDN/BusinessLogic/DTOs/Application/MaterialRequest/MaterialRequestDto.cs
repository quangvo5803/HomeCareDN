using BusinessLogic.DTOs.Application.Chat.User.Convesation;
using BusinessLogic.DTOs.Application.DistributorApplication;
using BusinessLogic.DTOs.Application.Review;
using BusinessLogic.DTOs.Authorize.User;
using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.MaterialRequest
{
    public class MaterialRequestDto
    {
        public Guid MaterialRequestID { get; set; }
        public Guid CustomerID { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
        public Guid? AddressID { get; set; }
        public AddressDto? Address { get; set; }
        public Guid? SelectedDistributorApplicationID { get; set; }
        public required string Description { get; set; }
        public bool CanEditQuantity { get; set; }
        public bool CanAddMaterial { get; set; }

        public DateTime CreatedAt { get; set; }
        public required string Status { get; set; }
        public int DistributorApplyCount { get; set; }

        public ICollection<MaterialRequestItemDto>? MaterialRequestItems { get; set; }
        public DistributorApplicationDto? SelectedDistributorApplication { get; set; }
        public ConversationDto? Conversation { get; set; }
        public ReviewDto? Review { get; set; }
        public DateTime? StartReviewDate { get; set; }
    }
}
