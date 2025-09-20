using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using BusinessLogic.DTOs.Authorize.Profiles;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Authorize;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ProfileService : IProfileService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;

        private const string ACCOUNT_STR = "Account";
        private const string ERROR_ACCOUNT_NOT_FOUND = "ACCOUNT_NOT_FOUND";
        private const string ERROR_USER_ID_MISMATCH = "USER_ID_MISMATCH";
        private const string ERROR_UPDATE_FAIL = "UPDATE_FAIL";

        public ProfileService(UserManager<ApplicationUser> userManager, IMapper mapper)
        {
            _userManager = userManager;
            _mapper = mapper;
        }

        public async Task<ProfileDto> GetProfileByIdAsync(string userId)
        {
            var user = await _userManager
                .Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user is null)
            {
                var dict = new Dictionary<string, string[]>
                {
                    { ACCOUNT_STR, new[] { ERROR_ACCOUNT_NOT_FOUND } },
                };
                throw new CustomValidationException(dict);
            }

            var dto = _mapper.Map<ProfileDto>(user);
            dto.Roles = (await _userManager.GetRolesAsync(user)).ToList(); // take role
            return dto;
        }

        public async Task UpdateProfileByIdAsync(UpdateProfileDto dto)
        {
            // indentify user
            if (string.IsNullOrWhiteSpace(dto.UserId))
            {
                var dict = new Dictionary<string, string[]>
                {
                    { ACCOUNT_STR, new[] { ERROR_USER_ID_MISMATCH } },
                };
                throw new CustomValidationException(dict);
            }

            var user = await _userManager.FindByIdAsync(dto.UserId);
            if (user is null)
            {
                var dict = new Dictionary<string, string[]>
                {
                    { ACCOUNT_STR, new[] { ERROR_ACCOUNT_NOT_FOUND } },
                };
                throw new CustomValidationException(dict);
            }

            _mapper.Map(dto, user); // AutoMapper already ignores overwrite
            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = result
                    .Errors.GroupBy(e => e.Code ?? ACCOUNT_STR)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.Description ?? ERROR_UPDATE_FAIL).ToArray()
                    );

                throw new CustomValidationException(errors);
            }
        }
    }
}
