using System;
using System.Threading.Tasks;
using BusinessLogic.DTOs.Authorize.Address;
using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Customer")]
public class AddressesController : ControllerBase
{
    private readonly IAddressService _addressService;

    public AddressesController(IAddressService addressService) => _addressService = addressService;

    // Lấy tất cả địa chỉ theo userId (không dùng claims)
    // GET: api/addresses/by-user/{userId}
    [HttpGet("address-by-user/{userId}")]
    public async Task<IActionResult> GetAddressByUserId([FromRoute] string userId) =>
        Ok(await _addressService.GetAddressByUserIdAsync(userId));

    [HttpPost("create-address-by-user")]
    public async Task<IActionResult> CreateAddress([FromBody] CreateAddressDto dto)
    {
        var created = await _addressService.CreateAddressByUserIdAsync(dto);
        return Ok(created);
    }

    // Cập nhật địa chỉ theo AddressId (body phải chứa AddressId trùng route)
    // PUT: api/addresses/{id}
    [HttpPut("update-address")]
    public async Task<IActionResult> UpdateAddress([FromBody] UpdateAddressDto dto)
    {
        var updated = await _addressService.UpdateAddressAsync(dto);
        return Ok(updated);
    }

    // Xóa địa chỉ theo AddressId
    // DELETE: api/addresses/{id}
    [HttpDelete("delete-address/{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        await _addressService.DeleteAddressAsync(id);
        return NoContent();
    }
}
