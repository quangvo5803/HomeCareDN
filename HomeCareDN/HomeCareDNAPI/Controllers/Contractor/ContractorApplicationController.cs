using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.DTOs.Application.Partner;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Contractor
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(
        AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
        Roles = "Contractor"
    )]
    public class ContractorApplicationController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ContractorApplicationController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

<<<<<<< HEAD
=======
        [HttpGet("get-contractor-application")]
        public async Task<IActionResult> GetByApplication(
            [FromQuery] ContractorGetApplicationDto dto
        )
        {
            var request =
                await _facadeService.ContractorApplicationService.GetApplicationByServiceRequestIDAndContractorIDAsync(
                    dto
                );
            return Ok(request);
        }

>>>>>>> develop
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

        [HttpDelete("delete-contractor-application/{id:guid}")]
        public async Task<IActionResult> DeleteAppication(Guid id)
        {
            await _facadeService.ContractorApplicationService.DeleteContractorApplicationAsync(id);
            return NoContent();
        }
    }
}
