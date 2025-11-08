using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Authorize.User;

namespace BusinessLogic.Services.Interfaces
{
    public interface IUserService
    {
        Task<PagedResultDto<UserDto>> GetAllUserAsync(QueryParameters parameters);
        Task<UserDto> GetUserByIdAsync(string userID);
    }
}
