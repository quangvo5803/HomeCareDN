using BusinessLogic.DTOs.Application;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialRequestsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public MaterialRequestsController(IFacadeService facadeService)
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
