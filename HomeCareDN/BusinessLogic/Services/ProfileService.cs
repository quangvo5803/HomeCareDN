using System.Security.Claims;
using AutoMapper;
using BusinessLogic.DTOs.Authorize.Profiles;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Authorize;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ProfileService : IProfileService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IHttpContextAccessor _http;
        private readonly IMapper _mapper;

        private const string ACCOUNT_STR = "Account";
        private const string ERROR_ACCOUNT_NOT_FOUND = "ERROR_ACCOUNT_NOT_FOUND";

        public ProfileService(
            UserManager<ApplicationUser> userManager,
            IHttpContextAccessor http,
            IMapper mapper
        )
        {
            _userManager = userManager;
            _http = http;
            _mapper = mapper;
        }

        private string CurrentUserId =>
            _http.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException();

        public async Task<ProfileDto> GetMineAsync()
        {
            var user =
                await _userManager
                    .Users.AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == CurrentUserId)
                ?? throw new UnauthorizedAccessException();

            var dto = _mapper.Map<ProfileDto>(user);
            dto.Roles = (await _userManager.GetRolesAsync(user)).ToList(); // Roles không ProjectTo được
            return dto;
        }

        public async Task UpdateAsync(UpdateProfileDto dto)
        {
            var user =
                await _userManager.FindByIdAsync(CurrentUserId)
                ?? throw new UnauthorizedAccessException();

            _mapper.Map(dto, user);

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var dict = result
                    .Errors.GroupBy(e => e.Code ?? "Account")
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.Description ?? "Update failed").ToArray()
                    );

                throw new CustomValidationException(dict);
            }
        }
    }
}
