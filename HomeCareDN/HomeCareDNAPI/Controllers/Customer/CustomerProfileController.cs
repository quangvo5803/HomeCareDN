using BusinessLogic.DTOs.Authorize.Profiles;
using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Customer;

public partial class CustomerController : ControllerBase
{
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
