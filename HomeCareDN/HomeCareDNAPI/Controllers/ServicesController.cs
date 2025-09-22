using BusinessLogic.DTOs.Application;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ServicesController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-services")]
        public async Task<IActionResult> GetAllServices([FromQuery] QueryParameters parameters)
        {
            var services = await _facadeService.ServiceService.GetAllServicesAsync(parameters);
            return Ok(services);
        }

        [HttpGet("get-service/{id:guid}")]
        public async Task<IActionResult> GetService(Guid id)
        {
            var brand = await _facadeService.ServiceService.GetServiceByIdAsync(id);
            return Ok(brand);
        }
    }
}
