using BusinessLogic.DTOs.Application;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminMaterialRequestController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public AdminMaterialRequestController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-material-request")]
        public async Task<IActionResult> GetAllMaterialRequest(
            [FromQuery] QueryParameters parameters
        )
        {
            return Ok(
                await _facadeService.MaterialRequestService.GetAllMaterialRequestsAsync(parameters)
            );
        }

        [HttpGet("get-material-request-by-id/{id:guid}")]
        public async Task<IActionResult> GetServiceRequestById(Guid id)
        {
            return Ok(await _facadeService.MaterialRequestService.GetMaterialRequestByIdAsync(id));
        }
    }
}
