namespace BusinessLogic.DTOs.Authorize
{
    public class TokenResponseDto
    {
        public string AccessToken { get; set; } = null!;
        public DateTime AccessTokenExpiresAt { get; set; }
        public string? RefreshToken { get; set; }
        public string? UserId { get; set; }
    }
}
