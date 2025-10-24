using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.DTOs.Application.Partner;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Contractor
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractorApplicationController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ContractorApplicationController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpPost("create-contractor-request")]
        public async Task<IActionResult> CreateApplication(
            [FromForm] ContractorCreateApplicationDto dto
        )
        {
            var request =
                await _facadeService.ContractorApplicationService.CreateContractorApplicationAsync(
                    dto
                );
            return Ok(request);
        }

        [HttpGet("get-contractor-application")]
        public async Task<IActionResult> GetByApplication(
            [FromQuery] ContractorGetApplicationDto dto
        )
        {
            var request =
                await _facadeService.ContractorApplicationService.GetApplicationByRequestAndContractorAsync(
                    dto
                );
            return Ok(request);
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

        [HttpDelete("delete-contractor-application/{id:guid}")]
        public async Task<IActionResult> DeleteAppication(Guid id)
        {
            await _facadeService.ContractorApplicationService.DeleteContractorApplicationAsync(id);
            return NoContent();
        }
    }
}
