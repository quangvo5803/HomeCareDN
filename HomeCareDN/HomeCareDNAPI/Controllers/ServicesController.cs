using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Service;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public class ServicesController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ServicesController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ServiceCreateRequestDto dto)
        {
            var service = await _facadeService.ServiceService.CreateServiceAsync(dto);
            return Ok(service);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] ServiceUpdateRequestDto dto)
        {
            var service = await _facadeService.ServiceService.UpdateServiceAsync(dto);
            return Ok(service);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _facadeService.ServiceService.DeleteServiceAsync(id);
            return NoContent();
        }

        [AllowAnonymous]
        [HttpGet("get-all-services")]
        public async Task<IActionResult> GetAll([FromQuery] QueryParameters parameters)
        {
            var services = await _facadeService.ServiceService.GetAllServicesAsync(parameters);
            return Ok(services);
        }

        [AllowAnonymous]
        [HttpGet("get-service/{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var brand = await _facadeService.ServiceService.GetServiceByIdAsync(id);
            return Ok(brand);
        }
    }
}
