namespace BusinessLogic.DTOs.Application.Partner
{
    public class PartnerRequestDto
    {
        public Guid PartnerID { get; set; }
        public required string FullName { get; set; }

        public required string PartnerType { get; set; } = default!;

        public required string CompanyName { get; set; } = default!;

        public required string Email { get; set; } = default!;

        public required string PhoneNumber { get; set; } = default!;

        public string? Description { get; set; }

        public string Status { get; set; } = default!;

        public string? RejectionReason { get; set; }

        public string? ApprovedUserId { get; set; }

        public DateTime CreatedAt { get; set; }
        public ICollection<string>? ImageUrls { get; set; }
        public ICollection<string>? ImagePublicIds { get; set; }
    }
}
