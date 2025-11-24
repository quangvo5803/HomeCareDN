namespace BusinessLogic.DTOs.Application.PartnerRequest
{
    public class PartnerRequestDto
    {
        public Guid PartnerRequestID { get; set; }
        public required string FullName { get; set; }
        public required string PartnerRequestType { get; set; }
        public required string CompanyName { get; set; } = default!;
        public required string Email { get; set; } = default!;
        public required string PhoneNumber { get; set; } = default!;
        public string? Description { get; set; }
        public required string Status { get; set; }
        public string? RejectionReason { get; set; }
        public string? ApprovedUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsContractSigned { get; set; }
        public DateTime? SignedAt { get; set; }
        public string? SignatureUrl { get; set; }
        public ICollection<string>? ImageUrls { get; set; }
        public ICollection<string>? ImagePublicIds { get; set; }
        public ICollection<string>? DocumentUrls { get; set; }
        public ICollection<string>? DocumentPublicIds { get; set; }
    }
}
