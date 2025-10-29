using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [ApiController]
    [Route("api/contractor-applications")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ContractorApplicationsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ContractorApplicationsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        // ====================== ADMIN ======================
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAllForAdmin([FromQuery] QueryParameters parameters)
        {
            var result =
                await _facadeService.ContractorApplicationService.GetAllContractorApplicationByServiceRequestIdAsync(
                    parameters,
                    "Admin"
                );
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/{id:guid}")]
        public async Task<IActionResult> GetByIdForAdmin(Guid id)
        {
            var result =
                await _facadeService.ContractorApplicationService.GetContractorApplicationByIDAsync(
                    id,
                    "Admin"
                );
            return Ok(result);
        }

        // ====================== CUSTOMER ======================
        [Authorize(Roles = "Customer")]
        [HttpGet("customer")]
        public async Task<IActionResult> GetAllForCustomer([FromQuery] QueryParameters parameters)
        {
            var result =
                await _facadeService.ContractorApplicationService.GetAllContractorApplicationByServiceRequestIdAsync(
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
                await _facadeService.ContractorApplicationService.GetContractorApplicationByIDAsync(
                    id,
                    "Customer"
                );
            return Ok(result);
        }

        [Authorize(Roles = "Customer")]
        [HttpPut("customer/{contractorApplicationID:guid}/accept")]
        public async Task<IActionResult> Accept(Guid contractorApplicationID)
        {
            var request =
                await _facadeService.ContractorApplicationService.AcceptContractorApplicationAsync(
                    contractorApplicationID
                );
            return Ok(request);
        }

        [Authorize(Roles = "Customer")]
        [HttpPut("customer/{contractorApplicationID:guid}/reject")]
        public async Task<IActionResult> Reject(Guid contractorApplicationID)
        {
            var request =
                await _facadeService.ContractorApplicationService.RejectContractorApplicationAsync(
                    contractorApplicationID
                );
            return Ok(request);
        }

        // ====================== Contractor ======================
        [Authorize(Roles = "Contractor")]
        [HttpGet("contractor")]
        public async Task<IActionResult> GetAllForDistributor(
            [FromQuery] QueryParameters parameters
        )
        {
            var result =
                await _facadeService.ContractorApplicationService.GetAllContractorApplicationByServiceRequestIdAsync(
                    parameters,
                    "Contractor"
                );
            return Ok(result);
        }

        [Authorize(Roles = "Contractor")]
        [HttpGet("contractor/{id:guid}")]
        public async Task<IActionResult> GetByIdForDistributor(Guid id)
        {
            var result =
                await _facadeService.ContractorApplicationService.GetContractorApplicationByIDAsync(
                    id,
                    "Contractor"
                );
            return Ok(result);
        }

        [Authorize(Roles = "Contractor")]
        [HttpGet("contractor/get-applied")]
        public async Task<IActionResult> GetByServiceRequestIdForDistributor(
            [FromQuery] ContractorApplicationGetDto contractorApplicationGetDto
        )
        {
            var result =
                await _facadeService.ContractorApplicationService.GetContractorApplicationByServiceRequestIDAsync(
                    contractorApplicationGetDto
                );
            return Ok(result);
        }

        [Authorize(Roles = "Contractor")]
        [HttpPost("contractor")]
        public async Task<IActionResult> Create([FromBody] ContractorCreateApplicationDto dto)
        {
            var request =
                await _facadeService.ContractorApplicationService.CreateContractorApplicationAsync(
                    dto
                );
            return Ok(request);
        }

        [Authorize(Roles = "Contractor")]
        [HttpDelete("contractor/{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _facadeService.ContractorApplicationService.DeleteContractorApplicationAsync(id);
            return NoContent();
        }
    }
}
