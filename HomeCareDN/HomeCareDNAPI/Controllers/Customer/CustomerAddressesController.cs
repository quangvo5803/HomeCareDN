using BusinessLogic.DTOs.Authorize.Address;
using BusinessLogic.Services.FacadeService;
using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Customer;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Customer")]
public partial class CustomerController : ControllerBase
{
    private readonly IAddressService _addressService;
    private readonly IProfileService _profileService;
    private readonly IFacadeService _facadeService;

    public CustomerController(
        IAddressService addressService,
        IProfileService profileService,
        IFacadeService facadeService
    )
    {
        _addressService = addressService;
        _profileService = profileService;
        _facadeService = facadeService;
    }

    [HttpGet("get-user-address/{userId}")]
    public async Task<IActionResult> GetAddressByUserId([FromRoute] string userId)
    {
        var addresses = await _addressService.GetAddressByUserIdAsync(userId);
        return Ok(addresses);
    }

    [HttpPost("create-address")]
    public async Task<IActionResult> CreateAddress([FromBody] CreateAddressDto dto)
    {
        var created = await _addressService.CreateAddressByUserIdAsync(dto);
        return Ok(created);
    }

    [HttpPut("update-address")]
    public async Task<IActionResult> UpdateAddress([FromBody] UpdateAddressDto dto)
    {
        var updated = await _addressService.UpdateAddressAsync(dto);
        return Ok(updated);
    }

    [HttpDelete("delete-address/{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        await _addressService.DeleteAddressAsync(id);
        return NoContent();
    }
}
