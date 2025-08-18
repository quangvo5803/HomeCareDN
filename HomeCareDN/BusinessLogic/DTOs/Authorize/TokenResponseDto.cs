namespace BusinessLogic.DTOs.Authorize
{
    public class TokenResponseDto
    {
        public string? AccessToken { get; set; }
        public DateTime AccessTokenExpiresAt { get; set; }
    }
}
