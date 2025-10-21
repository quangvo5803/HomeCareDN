using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.MaterialRequest;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Customer
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Customer")]
    public class CustomerMaterialRequestsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public CustomerMaterialRequestsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-material-request-by-userid")]
        public async Task<IActionResult> GetAllServiceRequestByUserId(
            [FromQuery] QueryParameters parameters
        )
        {
            return Ok(
                await _facadeService.MaterialRequestService.GetAllMaterialRequestByUserIdAsync(
                    parameters
                )
            );
        }

        [HttpPost("create-material-request")]
        public async Task<IActionResult> CreateServiceRequest(
            [FromForm] MaterialRequestCreateRequestDto createRequest
        )
        {
            return Ok(
                await _facadeService.MaterialRequestService.CreateNewMaterialRequestAsync(
                    createRequest
                )
            );
        }

        [HttpPut("update-service-request")]
        public async Task<IActionResult> UpdateServiceRequest(
            [FromForm] MaterialRequestUpdateRequestDto updateRequest
        )
        {
            return Ok(
                await _facadeService.MaterialRequestService.UpdateMaterialRequestAsync(
                    updateRequest
                )
            );
        }

        [HttpDelete("delete-material-request/{id:guid}")]
        public async Task<IActionResult> DeleteMaterialRequest(Guid id)
        {
            await _facadeService.MaterialRequestService.DeleteMaterialRequest(id);
            return NoContent();
        }
    }
}
