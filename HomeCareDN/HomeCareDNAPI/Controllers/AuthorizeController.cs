using BusinessLogic.DTOs.Authorize;
using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthorizeController : ControllerBase
    {
        private readonly IAuthorizeService _authorizeService;

        public AuthorizeController(IAuthorizeService authorizeService)
        {
            _authorizeService = authorizeService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
        {
            await _authorizeService.SendRegisterOtpAsync(dto.Email, dto.FullName);
            return Ok(new { message = "OTP đã được gửi đến email của bạn" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            var result = await _authorizeService.SendLoginOtpAsync(dto);
            return Ok(result);
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequestDto dto)
        {
            var tokens = await _authorizeService.VerifyOtpAsync(dto.Email, dto.OTP);
            return Ok(tokens);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var tokenResponse = await _authorizeService.RefreshTokenAsync();
            return Ok(tokenResponse);
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequestDto request)
        {
            var tokenResponse = await _authorizeService.GoogleLoginAsync(request);
            return Ok(tokenResponse);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _authorizeService.Logout();
            return Ok();
        }
    }
}
