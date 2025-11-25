using System.Security.Claims;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.DistributorApplication;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class DistributorApplicationsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public DistributorApplicationsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        // ====================== CUSTOMER ======================
        [Authorize(Roles = "Customer")]
        [HttpGet("customer/all")]
        public async Task<IActionResult> GetAllByMaterialRequestIdForCustomer(
            [FromQuery] QueryParameters parameters
        )
        {
            var result =
                await _facadeService.DistributorApplicationService.GetAllDistributorApplicationByMaterialRequestId(
                    parameters,
                    "Customer"
                );
            return Ok(result);
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("customer/{id:guid}")]
        public async Task<IActionResult> GetByIdForCustomer(Guid id)
        {
            var result =
                await _facadeService.DistributorApplicationService.GetDistributorApplicationById(
                    id,
                    "Customer"
                );
            return Ok(result);
        }

        // ====================== DISTRIBUTOR ======================
        [Authorize(Roles = "Distributor")]
        [HttpGet("distributor/applications")]
        public async Task<IActionResult> GetApplications([FromQuery] QueryParameters parameters)
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(sub, out var distributorId))
                return Unauthorized("Invalid distributor ID.");

            parameters.FilterID = distributorId;

            var result =
                await _facadeService.DistributorApplicationService.GetAllDistributorApplicationByUserIdAsync(
                    parameters
                );
            return Ok(result);
        }

        [Authorize(Roles = "Distributor")]
        [HttpGet("distributor/applied")]
        public async Task<IActionResult> GetByMaterialRequestId(
            [FromQuery] DistributorApplicationGetByIdDto byIdRequest
        )
        {
            return Ok(
                await _facadeService.DistributorApplicationService.GetDistributorApplicationByMaterialRequestId(
                    byIdRequest
                )
            );
        }

        [Authorize(Roles = "Distributor")]
        [HttpPost("distributor/create")]
        public async Task<IActionResult> CreateDistributorApplication(
            [FromBody] DistributorCreateApplicationDto createRequest
        )
        {
            var result =
                await _facadeService.DistributorApplicationService.CreateDistributorApplicationAsync(
                    createRequest
                );
            return Ok(result);
        }

        [Authorize(Roles = "Distributor")]
        [HttpDelete("distributor/delete/{id:guid}")]
        public async Task<IActionResult> DeleteDistributorApplication(Guid id)
        {
            await _facadeService.DistributorApplicationService.DeleteDistributorApplicationAsync(
                id
            );
            return NoContent();
        }
    }
}
