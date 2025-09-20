using BusinessLogic.DTOs.Authorize.Address;
using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Customer;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Customer")]
public class AddressesController : ControllerBase
{
    private readonly IAddressService _addressService;

    public AddressesController(IAddressService addressService)
    {
        _addressService = addressService;
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
