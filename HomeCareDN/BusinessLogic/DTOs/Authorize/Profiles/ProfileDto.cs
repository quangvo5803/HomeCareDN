using DataAccess.Entities.Authorize;

namespace BusinessLogic.DTOs.Authorize.Profiles
{
    public class ProfileDto
    {
        public string UserId { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public string? PhoneNumber { get; set; }
        public Gender? Gender { get; set; }
        public IList<string> Roles { get; set; } = new List<string>();
    }
}
