using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using AutoMapper;
using BusinessLogic.DTOs.Authorize;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Authorize;
using DataAccess.Repositories.Interfaces;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Ultitity.Email.Interface;
using Ultitity.Exceptions;
using Ultitity.Options;

namespace BusinessLogic.Services
{
    public class AuthorizeService : IAuthorizeService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailQueue _emailQueue;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly JwtOptions _jwtOptions;
        private readonly GoogleOptions _googleOptions;

        private const int RefreshTokenDays = 7;
        private const int OtpExpiryMinutes = 5;
        private const int OtpThrottleSeconds = 60;

        private const string ACCOUNT_STR = "Account";
        private const string REFRESH_TOKEN_STR = "refreshToken";
        private const string LOGIN_TOKEN_EXPIRED_STR = "LOGIN_TOKEN_EXPIRED";

        public AuthorizeService(
            UserManager<ApplicationUser> userManager,
            IEmailQueue emailQueue,
            IRefreshTokenRepository refreshTokenRepository,
            IHttpContextAccessor httpContextAccessor,
            IOptions<JwtOptions> jwtOptions,
            IOptions<GoogleOptions> googleOptions
        )
        {
            _userManager = userManager;
            _emailQueue = emailQueue;
            _refreshTokenRepository = refreshTokenRepository;
            _httpContextAccessor = httpContextAccessor;
            _jwtOptions = jwtOptions.Value;
            _googleOptions = googleOptions.Value;
        }

        #region OTP

        public async Task SendLoginOtpAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ACCOUNT_STR, new[] { "LOGIN_NOT_FOUND" } },
                    }
                );

            await SendOtpInternalAsync(user, "Login");
        }

        public async Task SendRegisterOtpAsync(string email, string fullName)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    Email = email,
                    UserName = email,
                    FullName = fullName,
                };
                await _userManager.CreateAsync(user);
                await _userManager.AddToRoleAsync(user, "Customer");
            }

            if (!user.EmailConfirmed)
            {
                await SendOtpInternalAsync(user, "Register");
            }
            else
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ACCOUNT_STR, new[] { "REGISTER_ALREADY_EXISTS" } },
                    }
                );
            }
        }

        private async Task SendOtpInternalAsync(ApplicationUser user, string purpose)
        {
            if (
                user.LastOTPSentAt.HasValue
                && DateTime.UtcNow < user.LastOTPSentAt.Value.AddSeconds(OtpThrottleSeconds)
            )
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ACCOUNT_STR, new[] { "OTP_REQUEST_TOO_FREQUENT" } },
                    }
                );

            // Tạo OTP
            var otpBytes = new byte[4];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(otpBytes);
            var otp = BitConverter.ToUInt32(otpBytes, 0) % 1000000;
            user.CurrentOTP = otp.ToString("D6");
            user.OTPExpiresAt = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes);
            user.LastOTPSentAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            // Gửi Email (giữ nguyên code HTML như cũ)
            var subject =
                purpose == "Login"
                    ? "Đăng nhập HomeCareDN: Mã xác minh 6 chữ số"
                    : "Đăng ký HomeCareDN: Mã xác minh 6 chữ số";
            string purposeContent =
                purpose == "Login"
                    ? "Bạn đã yêu cầu mã xác minh để đăng nhập vào HomeCareDN. Vui lòng nhập mã dưới đây để tiếp tục."
                    : "Cảm ơn bạn đã đăng ký HomeCareDN! Vui lòng nhập mã xác minh dưới đây để hoàn tất quá trình đăng ký.";

            var htmlMessage =
                $"<table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse: collapse; width: 100%; font-family: sans-serif; background-color: #fff5f0; padding: 20px;\">"
                + $"<tr><td align=\"center\">"
                + $"<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"width: 100%; max-width: 600px; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(255, 140, 0, 0.1);\">"
                + $"<tr><td style=\"padding: 24px 32px;\">"
                + $"<div style=\"text-align: left;\">"
                + $"<img src=\"https://res.cloudinary.com/dl4idg6ey/image/upload/v1749266020/logoh_enlx7y.png\" alt=\"HomeCareDN\" style=\"height: 32px; filter: brightness(0) invert(1);\">"
                + $"</div>"
                + $"</td></tr>"
                + $"<tr><td style=\"padding: 32px;\">"
                + $"<p style=\"font-size: 18px; color: #2d2d2d; margin-bottom: 8px; font-weight: 600;\">Chào {user.FullName}!</p>"
                + $"<p style=\"font-size: 16px; color: #4a4a4a; margin-bottom: 28px; line-height: 1.5;\">{purposeContent}</p>"
                + $"<div style=\"background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%); border: 2px solid #ff8c00; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;\">"
                + $"<p style=\"font-size: 36px; font-weight: bold; color: #ff6600; margin: 0; letter-spacing: 6px; text-shadow: 0 2px 4px rgba(255, 102, 0, 0.1);\">{user.CurrentOTP}</p>"
                + $"</div>"
                + $"<div style=\"background-color: #fff5f0; border-left: 4px solid #ff8c00; border-radius: 0 8px 8px 0; padding: 16px; margin: 24px 0;\">"
                + $"<p style=\"font-size: 14px; color: #ff6600; margin: 0; font-weight: 500;\">⏰ Mã này sẽ hết hạn sau 5 phút.</p>"
                + $"</div>"
                + $"<p style=\"font-size: 14px; color: #888; margin-top: 20px;\">Bỏ qua email nếu bạn không yêu cầu mã này.</p>"
                + $"</td></tr>"
                + $"<tr><td style=\"padding: 20px 32px; background: linear-gradient(135deg, #ff8c00 0%, #ff7700 100%); font-size: 12px; color: white; text-align: center;\">"
                + $"<p style=\"margin: 0; opacity: 0.9;\">📍 Người gửi: HomeCareDN</p>"
                + $"<p style=\"margin: 4px 0 0 0; opacity: 0.8;\">Khu đô thị FPT City, Ngũ Hành Sơn, Đà Nẵng 550000</p>"
                + $"</td></tr>"
                + $"</table>"
                + $"</td></tr>"
                + $"</table>";
            ; // giữ nguyên nội dung HTML như trước

            if (!string.IsNullOrEmpty(user.Email))
                _emailQueue.QueueEmail(user.Email, subject, htmlMessage);
        }

        public async Task<TokenResponseDto> VerifyOtpAsync(string email, string otp)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || user.CurrentOTP != otp || user.OTPExpiresAt < DateTime.UtcNow)
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ACCOUNT_STR, new[] { "OTP_INVALID_OR_EXPIRED" } },
                    }
                );

            user.CurrentOTP = null;
            user.OTPExpiresAt = null;
            user.EmailConfirmed = true;

            // Xóa refresh token cũ
            var oldToken = await _refreshTokenRepository.GetByUserIdAsync(user.Id);
            if (oldToken != null)
                await _refreshTokenRepository.DeleteAsync(oldToken);

            // Tạo token mới
            var tokenOptions = GenerateTokenOptions(await GetClaims(user));
            var accessToken = new JwtSecurityTokenHandler().WriteToken(tokenOptions);
            var refreshToken = GenerateRefreshToken();
            var rt = new RefreshToken
            {
                Token = refreshToken,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(RefreshTokenDays),
            };
            await _refreshTokenRepository.AddAsync(rt);
            await _userManager.UpdateAsync(user);

            // Gửi cookie HttpOnly
            SetRefreshTokenCookie(refreshToken);

            return new TokenResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiresAt = tokenOptions.ValidTo,
                UserId = user.Id,
            };
        }

        #endregion

        #region Token

        public async Task<TokenResponseDto> RefreshTokenAsync()
        {
            var cookieToken = _httpContextAccessor.HttpContext.Request.Cookies[REFRESH_TOKEN_STR];
            if (string.IsNullOrEmpty(cookieToken))
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ACCOUNT_STR, new[] { LOGIN_TOKEN_EXPIRED_STR + "1" } },
                    }
                );

            var refreshToken = await _refreshTokenRepository.GetByTokenAsync(cookieToken);
            if (refreshToken == null || refreshToken.ExpiresAt < DateTime.UtcNow)
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ACCOUNT_STR, new[] { LOGIN_TOKEN_EXPIRED_STR + "2" } },
                    }
                );

            var user = await _userManager.FindByIdAsync(refreshToken.UserId);
            if (user == null || !user.EmailConfirmed)
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ACCOUNT_STR, new[] { LOGIN_TOKEN_EXPIRED_STR + "3" } },
                    }
                );

            // Tạo access token mới
            var tokenOptions = GenerateTokenOptions(await GetClaims(user));
            var accessToken = new JwtSecurityTokenHandler().WriteToken(tokenOptions);

            // Gia hạn refresh token nếu còn < 1 ngày
            if ((refreshToken.ExpiresAt - DateTime.UtcNow).TotalDays < 1)
            {
                var newRefreshToken = GenerateRefreshToken();
                refreshToken.Token = newRefreshToken;
                await _refreshTokenRepository.UpdateAsync(refreshToken);
                SetRefreshTokenCookie(newRefreshToken);
            }

            return new TokenResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                AccessTokenExpiresAt = tokenOptions.ValidTo,
                UserId = user.Id,
            };
        }

        #endregion

        #region Google Login

        public async Task<TokenResponseDto> GoogleLoginAsync(GoogleLoginRequestDto requestDto)
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(
                requestDto.Credential,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _googleOptions.GoogleClientId },
                }
            );

            var user = await _userManager.FindByEmailAsync(payload.Email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = payload.Email,
                    Email = payload.Email,
                    FullName = payload.Name,
                    EmailConfirmed = true,
                };
                await _userManager.CreateAsync(user);
                await _userManager.AddToRoleAsync(user, "Customer");
            }

            var oldToken = await _refreshTokenRepository.GetByUserIdAsync(user.Id);
            if (oldToken != null)
                await _refreshTokenRepository.DeleteAsync(oldToken);

            var tokenOptions = GenerateTokenOptions(await GetClaims(user));
            var accessToken = new JwtSecurityTokenHandler().WriteToken(tokenOptions);
            var refreshToken = GenerateRefreshToken();

            var rt = new RefreshToken
            {
                Token = refreshToken,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(RefreshTokenDays),
            };
            await _refreshTokenRepository.AddAsync(rt);

            SetRefreshTokenCookie(refreshToken);

            return new TokenResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiresAt = tokenOptions.ValidTo,
                UserId = user.Id,
            };
        }

        #endregion

        #region JWT Helper

        public async Task<string> GenerateToken(ApplicationUser user)
        {
            var claims = await GetClaims(user);
            var tokenOptions = GenerateTokenOptions(claims);
            return new JwtSecurityTokenHandler().WriteToken(tokenOptions);
        }

        private async Task<List<Claim>> GetClaims(ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };
            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));
            return claims;
        }

        private JwtSecurityToken GenerateTokenOptions(List<Claim> claims)
        {
            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_jwtOptions.Key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            return new JwtSecurityToken(
                issuer: _jwtOptions.Issuer,
                audience: _jwtOptions.Audience,
                claims: claims,
                expires: DateTime
                    .UtcNow.AddMinutes(_jwtOptions.AccessTokenMinutes)
                    .AddSeconds(Random.Shared.Next(-30, 31)),
                signingCredentials: creds
            );
        }

        private static string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private void SetRefreshTokenCookie(string refreshToken)
        {
            var isDev = _httpContextAccessor.HttpContext.Request.Host.Host.Contains("localhost");

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDev,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(RefreshTokenDays),
                Path = "/",
            };

            if (!isDev)
            {
                cookieOptions.Domain = "homecaredn-api.onrender.com";
            }

            _httpContextAccessor.HttpContext.Response.Cookies.Append(
                REFRESH_TOKEN_STR,
                refreshToken,
                cookieOptions
            );
        }

        #endregion

        #region Logout

        public async Task Logout()
        {
            var cookieToken = _httpContextAccessor.HttpContext.Request.Cookies[REFRESH_TOKEN_STR];
            if (!string.IsNullOrEmpty(cookieToken))
            {
                var refreshToken = await _refreshTokenRepository.GetByTokenAsync(cookieToken);
                if (refreshToken != null)
                    await _refreshTokenRepository.DeleteAsync(refreshToken);
            }

            // Xóa cookie
            _httpContextAccessor.HttpContext.Response.Cookies.Append(
                REFRESH_TOKEN_STR,
                "",
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTime.UtcNow.AddDays(-1),
                    Path = "/",
                }
            );
        }

        #endregion
    }
}
