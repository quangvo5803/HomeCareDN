using BusinessLogic.DTOs.Application;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceRequestController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ServiceRequestController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-servicerequest")]
        public async Task<IActionResult> GetAllServiceRequest([FromQuery] QueryParameters parameters)
        {
            return Ok(await _facadeService.ServiceRequestService.GetAllServiceRequestAsync(parameters));
        }

        [HttpGet("get-servicerequest-byid/{id:guid}")]
        public async Task<IActionResult> GetServiceRequestById(Guid id)
        {
            return Ok(await _facadeService.ServiceRequestService
                .GetServiceRequestByIdAsync(id)
            );
        }
    }
}
