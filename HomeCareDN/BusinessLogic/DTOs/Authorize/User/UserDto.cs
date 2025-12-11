namespace BusinessLogic.DTOs.Authorize.User
{
    public class UserDto
    {
        public required string UserID { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public string? PhoneNumber { get; set; }
        public int ProjectCount { get; set; }
        public double AverageRating { get; set; }
        public int SmallScaleProjectCount { get; set; }
        public int MediumScaleProjectCount { get; set; }
        public int LargeScaleProjectCount { get; set; }
        public int ReputationPoints { get; set; }
        public string? Role { get; set; }
        public string? Gender { get; set; }
        public List<AddressDto>? Addresses { get; set; }
    }
}
