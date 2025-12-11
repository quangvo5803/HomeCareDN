using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace DataAccess.Entities.Authorize
{
    public class ApplicationUser : IdentityUser
    {
        public required string FullName { get; set; }
        public Gender? Gender { get; set; }
        public string? CurrentOTP { get; set; }
        public DateTime? OTPExpiresAt { get; set; }
        public DateTime? LastOTPSentAt { get; set; }
        public double AverageRating { get; set; }
        public int RatingCount { get; set; }
        public int ProjectCount { get; set; }
        public int SmallScaleProjectCount { get; set; } = 0;
        public int MediumScaleProjectCount { get; set; } = 0;
        public int LargeScaleProjectCount { get; set; } = 0;
        public int ReputationPoints { get; set; } = 0;
        public ICollection<RefreshToken>? RefreshTokens { get; set; }
        public ICollection<Address> Addresses { get; set; } = new List<Address>();
    }

    public enum Gender
    {
        [Display(Name = "Male")]
        Male,

        [Display(Name = "Female")]
        Female,

        [Display(Name = "Other")]
        Other,
    }
}
