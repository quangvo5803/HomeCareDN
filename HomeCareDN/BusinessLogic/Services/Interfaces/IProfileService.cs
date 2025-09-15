using BusinessLogic.DTOs.Authorize.Profiles;

namespace BusinessLogic.Services.Interfaces
{
    public interface IProfileService
    {
        Task<ProfileDto> GetProfileByIdAsync(string userId);
        Task UpdateProfileByIdAsync(UpdateProfileDto dto);
    }
}
