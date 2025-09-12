using BusinessLogic.DTOs.Authorize.Address;
using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class AddressesController : ControllerBase
{
    private readonly IAddressService _addressService;

    public AddressesController(IAddressService addressService) => _addressService = addressService;

    [HttpGet]
    public async Task<IActionResult> GetMine() => Ok(await _addressService.GetMineAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id) => Ok(await _addressService.GetByIdAsync(id));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAddressDto dto)
    {
        var created = await _addressService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAddressDto dto)
    {
        await _addressService.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _addressService.DeleteAsync(id);
        return NoContent();
    }
}
