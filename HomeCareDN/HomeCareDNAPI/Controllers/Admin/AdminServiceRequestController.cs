using BusinessLogic.DTOs.Application;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public class AdminServiceRequestController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public AdminServiceRequestController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-service-request")]
        public async Task<IActionResult> GetAllServiceRequest(
            [FromQuery] QueryParameters parameters
        )
        {
            return Ok(
                await _facadeService.ServiceRequestService.GetAllServiceRequestAsync(parameters)
            );
        }

        [HttpGet("get-service-request-by-id/{id:guid}")]
        public async Task<IActionResult> GetServiceRequestById(Guid id)
        {
            return Ok(await _facadeService.ServiceRequestService.GetServiceRequestByIdAsync(id));
        }
    }
}
