namespace BusinessLogic.DTOs.Application.Review
{
    public class ReviewCreateRequestDto
    {
        public required string UserID { get; set; }
        public Guid? ServiceRequestID { get; set; }
        public Guid? MaterialRequestID { get; set; }
        public required string PartnerID { get; set; }
        public required int Rating { get; set; }
        public string? Comment { get; set; }
        public List<string>? ImageUrls { get; set; }
        public List<string>? ImagePublicIds { get; set; }
    }
}
