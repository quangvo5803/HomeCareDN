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
            [FromForm] ContractorApplicationApplyDto request
        )
        {
            var contractor =
                await _facadeService.ContractorApplicationService.CreateContractorApplicationAsync(
                    request
                );
            return Ok(contractor);
        }

        [HttpGet("get-contractor-application")]
        public async Task<IActionResult> GetByApplication(
            [FromQuery] Guid serviceRequestId,
            [FromQuery] Guid contractorId
        )
        {
            var dto =
                await _facadeService.ContractorApplicationService.GetApplicationByRequestAndContractorAsync(
                    serviceRequestId,
                    contractorId
                );
            return Ok(dto);
        }

        [HttpDelete("delete-contractor-application/{contractorApplicationId:guid}")]
        public async Task<IActionResult> DeleteAppication(
            [FromRoute] Guid contractorApplicationId,
            [FromQuery] Guid contractorId
        )
        {
            await _facadeService.ContractorApplicationService.DeleteContractorApplicationAsync(
                contractorApplicationId,
                contractorId
            );
            return NoContent();
        }
    }
}
