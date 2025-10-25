using BusinessLogic.DTOs.Application;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Customer
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Customer")]
    public class CustomerContractorApplicationController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public CustomerContractorApplicationController(IFacadeService facadeService)
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

        [HttpPut("accept-contractor-application/{contractorApplicationID:guid}")]
        public async Task<IActionResult> AcceptApplication(Guid contractorApplicationID)
        {
            var request =
                await _facadeService.ContractorApplicationService.AcceptContractorApplicationAsync(
                    contractorApplicationID
                );
            return Ok(request);
        }

        [HttpPut("reject-contractor-application/{contractorApplicationID:guid}")]
        public async Task<IActionResult> RejectApplication(Guid contractorApplicationID)
        {
            var request =
                await _facadeService.ContractorApplicationService.RejectContractorApplicationAsync(
                    contractorApplicationID
                );
            return Ok(request);
        }
    }
}
