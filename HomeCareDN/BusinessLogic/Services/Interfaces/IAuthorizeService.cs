using BusinessLogic.DTOs.Authorize;
using DataAccess.Entities.Authorize;

namespace BusinessLogic.Services.Interfaces
{
    public interface IAuthorizeService
    {
        Task SendRegisterOtpAsync(string email, string fullName);
        Task SendLoginOtpAsync(string email);
        Task<TokenResponseDto> VerifyOtpAsync(string email, string otp);
        Task<TokenResponseDto> RefreshTokenAsync();
        Task<string> GenerateToken(ApplicationUser user);
        string GenerateRefeshToken();
    }
}
