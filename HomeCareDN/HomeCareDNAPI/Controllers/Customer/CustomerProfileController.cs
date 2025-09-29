using BusinessLogic.DTOs.Authorize.Profiles;
using BusinessLogic.Services.FacadeService;
using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Customer
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Customer")]
    public class CustomerProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public CustomerProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        [HttpGet("get-profile/{userId}")]
        public async Task<IActionResult> GetProfileById([FromRoute] string userId) =>
            Ok(await _profileService.GetProfileByIdAsync(userId));

        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfileById([FromBody] UpdateProfileDto dto)
        {
            await _profileService.UpdateProfileByIdAsync(dto);
            return NoContent();
        }
    }
}
