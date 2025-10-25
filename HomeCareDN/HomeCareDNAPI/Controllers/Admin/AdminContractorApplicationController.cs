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
    public class AdminContractorApplicationController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public AdminContractorApplicationController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-contractor-by-service-request-id")]
        public async Task<IActionResult> GetAllContractorByServiceRequestId(
            [FromQuery] QueryParameters parameters
        )
        {
            return Ok(
                await _facadeService.ContractorApplicationService.GetAllContractorByServiceRequestIdAsync(
                    parameters
                )
            );
        }
    }
}
