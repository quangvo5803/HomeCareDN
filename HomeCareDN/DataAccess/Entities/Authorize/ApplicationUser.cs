using Microsoft.AspNetCore.Identity;

namespace DataAccess.Entities.Authorize
{
    public class ApplicationUser : IdentityUser
    {
        public required string FullName { get; set; }
        public Gender? Gender { get; set; }
        public string? CurrentOTP { get; set; }
        public DateTime? OTPExpiresAt { get; set; }
        public ICollection<RefreshToken>? RefreshTokens { get; set; }
    }

    public enum Gender
    {
        Male,
        Female,
        Other,
    }
}
