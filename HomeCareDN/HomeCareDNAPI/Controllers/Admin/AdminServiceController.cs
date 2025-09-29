using BusinessLogic.DTOs.Application.Service;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public class AdminServiceController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public AdminServiceController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpPost("create-service")]
        public async Task<IActionResult> CreateService([FromForm] ServiceCreateRequestDto dto)
        {
            var service = await _facadeService.ServiceService.CreateServiceAsync(dto);
            return Ok(service);
        }

        [HttpPut("update-service")]
        public async Task<IActionResult> UpdateService([FromForm] ServiceUpdateRequestDto dto)
        {
            var service = await _facadeService.ServiceService.UpdateServiceAsync(dto);
            return Ok(service);
        }

        [HttpDelete("delete-service/{id:guid}")]
        public async Task<IActionResult> DeleteService(Guid id)
        {
            await _facadeService.ServiceService.DeleteServiceAsync(id);
            return NoContent();
        }
    }
}
