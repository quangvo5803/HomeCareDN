using BusinessLogic.DTOs.Authorize.Profiles;
using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _svc;

    public ProfileController(IProfileService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetMine() => Ok(await _svc.GetMineAsync());

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProfileDto dto)
    {
        await _svc.UpdateAsync(dto);
        return NoContent();
    }
}
