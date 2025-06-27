using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractorApplicationsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ContractorApplicationsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("getall")]
        public async Task<IActionResult> GetAllHardContractorApplcaitons(
            [FromQuery] ContractorApplicationGetAllRequestDto request
        )
        {
            var applications =
                await _facadeService.ContractorApplicationService.GetAllContractorApplicationsAsync(
                    request
                );
            return Ok(applications);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetContractorApplicationById(Guid id)
        {
            var application =
                await _facadeService.ContractorApplicationService.GetContractorApplicationByIdAsync(
                    id
                );
            if (application == null)
            {
                return NotFound();
            }
            return Ok(application);
        }

        [HttpPost]
        public async Task<IActionResult> CreateContractorApplication(
            [FromQuery] ContractorApplicationCreateRequestDto requestDto
        )
        {
            if (requestDto == null)
            {
                return BadRequest("Invalid contractor application data.");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var createdApplication =
                await _facadeService.ContractorApplicationService.CreateContractorApplicationAsync(
                    requestDto
                );
            return CreatedAtAction(
                nameof(GetContractorApplicationById),
                new { id = createdApplication.ContractorApplicationID },
                createdApplication
            );
        }

        [HttpPut]
        public async Task<IActionResult> UpdateContractorApplication(
            [FromQuery] ContractorApplicationUpdateRequestDto requestDto
        )
        {
            if (requestDto == null)
            {
                return BadRequest("Invalid contractor application data.");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var updatedApplication =
                await _facadeService.ContractorApplicationService.UpdateContractorApplicationAsync(
                    requestDto
                );
            if (updatedApplication == null)
            {
                return NotFound("Contractor Application not found or could not be updated.");
            }
            return Ok(updatedApplication);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContractorApplication(Guid id)
        {
            await _facadeService.ContractorApplicationService.DeleteContractorApplicationAsync(id);
            return NoContent();
        }
    }
}
