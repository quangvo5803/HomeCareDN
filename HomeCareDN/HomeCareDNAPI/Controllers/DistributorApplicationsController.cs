using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.DistributorApplication;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/distributor-applications")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class DistributorApplicationsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public DistributorApplicationsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        // ====================== ADMIN ======================
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAllForAdmin([FromQuery] QueryParameters parameters)
        {
            var result =
                await _facadeService.DistributorApplicationService.GetAllDistributorApplicationByMaterialRequestId(
                    parameters,
                    "Admin"
                );
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/get-all-by-user-id")]
        public async Task<IActionResult> GetAllByUserIdForAdmin(
            [FromQuery] QueryParameters parameters
        )
        {
            var result =
                await _facadeService.DistributorApplicationService.GetAllDistributorApplicationByUserIdAsync(
                    parameters
                );
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/{id:guid}")]
        public async Task<IActionResult> GetByIdForAdmin(Guid id)
        {
            var result =
                await _facadeService.DistributorApplicationService.GetDistributorApplicationById(
                    id,
                    "Admin"
                );
            return Ok(result);
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

        [Authorize(Roles = "Customer")]
        [HttpPut("customer/accept")]
        public async Task<IActionResult> Accept(
            [FromBody] DistributorApplicationAcceptRequestDto dto
        )
        {
            var request =
                await _facadeService.DistributorApplicationService.AcceptDistributorApplicationAsync(
                    dto
                );
            return Ok(request);
        }

        [Authorize(Roles = "Customer")]
        [HttpPut("customer/{distributorApplicationID:guid}/reject")]
        public async Task<IActionResult> Reject(Guid distributorApplicationID)
        {
            var request =
                await _facadeService.DistributorApplicationService.RejectDistributorApplicationAsync(
                    distributorApplicationID
                );
            return Ok(request);
        }

        // ====================== DISTRIBUTOR ======================
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
