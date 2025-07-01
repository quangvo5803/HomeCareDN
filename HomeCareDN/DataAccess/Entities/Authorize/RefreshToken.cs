namespace DataAccess.Entities.Authorize
{
    public class RefreshToken
    {
        public Guid Id { get; set; }
        public required string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
        public required string UserId { get; set; }
        public ApplicationUser? User { get; set; }
    }
}
