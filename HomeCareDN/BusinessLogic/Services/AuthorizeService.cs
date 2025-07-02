using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using BusinessLogic.DTOs.Authorize;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Authorize;
using DataAccess.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Ultitity.Email.Interface;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class AuthorizeService : IAuthorizeService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailQueue _emailQueue;
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public AuthorizeService(
            IConfiguration configuration,
            UserManager<ApplicationUser> userManager,
            IEmailQueue emailQueue,
            IRefreshTokenRepository refreshTokenRepository
        )
        {
            _configuration = configuration;
            _userManager = userManager;
            _emailQueue = emailQueue;
            _refreshTokenRepository = refreshTokenRepository;
        }

        public async Task SendLoginOtpAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Account", new[] { "Email not registered." } },
                };
                throw new CustomValidationException(errors);
            }

            await SendOtpInternalAsync(user, "Login");
        }

        public async Task SendRegisterOtpAsync(string email, string fullName)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = email,
                    FullName = fullName,
                    Email = email,
                };
                await _userManager.CreateAsync(user);
                await _userManager.AddToRoleAsync(user, "Customer");
                await SendOtpInternalAsync(user, "Register");
            }
            else
            {
                if (!user.EmailConfirmed)
                {
                    await SendOtpInternalAsync(user, "Register");
                }
                else
                {
                    var errors = new Dictionary<string, string[]>
                    {
                        { "Account", new[] { "Email has been registered and verified before." } },
                    };
                    throw new CustomValidationException(errors);
                }
            }
        }

        private async Task SendOtpInternalAsync(ApplicationUser user, string purpose)
        {
            if (DateTime.UtcNow.AddMinutes(2) > user.OTPExpiresAt)
            {
                var errors = new Dictionary<string, string[]>
                {
                    {
                        "Account",
                        new[] { "You are only sent a confirmation email every 2 minutes." }
                    },
                };
                throw new CustomValidationException(errors);
            }

            var otp = new Random().Next(100000, 999999).ToString();
            user.CurrentOTP = otp;
            user.OTPExpiresAt = DateTime.UtcNow.AddMinutes(5);
            await _userManager.UpdateAsync(user);

            var subject =
                purpose == "Login"
                    ? "Đăng nhập HomeCareDN: Đây là mã xác minh gồm 6 chữ số mà bạn đã yêu cầu"
                    : "Đăng kí HomeCareDN: Đây là mã xác minh gồm 6 chữ số mà bạn đã yêu cầu";
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
            if (user.Email != null)
            {
                _emailQueue.QueueEmail(user.Email, subject, htmlMessage);
            }
        }

        public async Task<TokenResponseDto> VerifyOtpAsync(string email, string otp)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || user.CurrentOTP != otp || user.OTPExpiresAt < DateTime.UtcNow)
            {
                var errors = new Dictionary<string, string[]>
                {
                    {
                        "Account",
                        new[] { "User does not exist or OTP code is expired or incorrect." }
                    },
                };
                throw new CustomValidationException(errors);
            }
            user.CurrentOTP = null;
            user.OTPExpiresAt = null;
            user.EmailConfirmed = true;
            var accessToken = await GenerateToken(user);
            var refreshToken = GenerateRefeshToken();
            var rt = new RefreshToken
            {
                Token = refreshToken,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
            };
            var token = await _refreshTokenRepository.GetByUserIdAsync(user.Id);
            if (token != null)
            {
                await _refreshTokenRepository.DeleteAsync(token);
            }
            await _refreshTokenRepository.AddAsync(rt);
            await _userManager.UpdateAsync(user);
            return new TokenResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(30),
            };
        }

        public async Task<TokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto requestDto)
        {
            var errors = new Dictionary<string, string[]>();

            var refreshToken = await _refreshTokenRepository.GetByTokenAsync(
                requestDto.RefreshToken
            );
            if (refreshToken == null || refreshToken.UserId != requestDto.UserId)
            {
                errors.Add("Account", new[] { "Refresh token incorrect or user mismatch." });
                throw new CustomValidationException(errors);
            }

            if (refreshToken.ExpiresAt < DateTime.UtcNow)
            {
                await _refreshTokenRepository.DeleteAsync(refreshToken);
                errors.Add("Account", new[] { "Refresh token expired." });
                throw new CustomValidationException(errors);
            }

            var user = await _userManager.FindByIdAsync(refreshToken.UserId);
            if (user == null || !user.EmailConfirmed)
            {
                errors.Add(
                    "Account",
                    new[] { user == null ? "User not found." : "Email not confirmed." }
                );
                throw new CustomValidationException(errors);
            }

            var accessToken = await GenerateToken(user);
            var newRefreshToken = GenerateRefeshToken();

            await _refreshTokenRepository.AddAsync(
                new RefreshToken
                {
                    Token = newRefreshToken,
                    UserId = user.Id,
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                }
            );

            return new TokenResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = newRefreshToken,
                AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(30),
            };
        }

        public async Task<string> GenerateToken(ApplicationUser user)
        {
            var claims = await GetClaims(user);
            var tokenOptions = GenerateTokenOptions(claims);
            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokenOptions);
            return tokenString;
        }

        public string GenerateRefeshToken()
        {
            var randomNumber = new byte[64];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
            }
            return Convert.ToBase64String(randomNumber);
        }

        private async Task<List<Claim>> GetClaims(ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
            };
            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }
            return claims;
        }

        private JwtSecurityToken GenerateTokenOptions(List<Claim> claims)
        {
            var key = new SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(_configuration["JWT:Key"])
            );
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:Issuer"],
                audience: _configuration["JWT:Audience"],
                claims,
                expires: DateTime.Now.AddMinutes(30),
                signingCredentials: credentials
            );
            return token;
        }
    }
}
