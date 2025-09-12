using BusinessLogic.DTOs.Authorize.Profiles;

namespace BusinessLogic.Services.Interfaces
{
    public interface IProfileService
    {
        Task<ProfileDto> GetMineAsync();
        Task UpdateAsync(UpdateProfileDto dto);
    }
}
