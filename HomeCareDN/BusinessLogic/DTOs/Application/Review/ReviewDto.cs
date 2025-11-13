namespace BusinessLogic.DTOs.Application.Review
{
    public class ReviewDto
    {
        public Guid ReviewID { get; set; }
        public required string UserID { get; set; }

        public Guid? ServiceRequestID { get; set; }
        public Guid? MaterialRequestID { get; set; }
        public string? PartnerID { get; set; }

        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<string>? ImageUrls { get; set; }
    }
}
