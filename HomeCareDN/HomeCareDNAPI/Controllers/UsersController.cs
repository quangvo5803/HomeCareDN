using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Authorize.User;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public UsersController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        // ============================ USER ============================
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllUserAsync([FromQuery] QueryParameters parameters)
        {
            var result = await _facadeService.UserService.GetAllUserAsync(parameters);
            return Ok(result);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("{userID}")]
        public async Task<IActionResult> GetUserByIdAsync(string userID)
        {
            var result = await _facadeService.UserService.GetUserByIdAsync(userID);
            return Ok(result);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpPut()]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDto dto)
        {
            await _facadeService.UserService.UpdateUserAsync(dto);
            return NoContent();
        }

        // ============================ ADDRESS ============================

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Customer"
        )]
        [HttpPost("addresses")]
        public async Task<IActionResult> CreateAddress([FromBody] CreateAddressDto dto)
        {
            var created = await _facadeService.UserService.CreateAddressByUserIdAsync(dto);
            return Ok(created);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Customer"
        )]
        [HttpPut("addresses")]
        public async Task<IActionResult> UpdateAddress([FromBody] UpdateAddressDto dto)
        {
            var updated = await _facadeService.UserService.UpdateAddressAsync(dto);
            return Ok(updated);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Customer"
        )]
        [HttpDelete("addresses/{id:guid}")]
        public async Task<IActionResult> DeleteAddress(Guid id)
        {
            await _facadeService.UserService.DeleteAddressAsync(id);
            return NoContent();
        }
    }
}
