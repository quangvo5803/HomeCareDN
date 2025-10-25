using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ServiceRequest;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Customer
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Customer")]
    public class CustomerServiceRequestController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public CustomerServiceRequestController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-service-request-by-user-id")]
        public async Task<IActionResult> GetAllServiceRequestByUserId(
            [FromQuery] QueryParameters parameters
        )
        {
            return Ok(
                await _facadeService.ServiceRequestService.GetAllServiceRequestByUserIdAsync(
                    parameters
                )
            );
        }

        [HttpGet("get-service-request-by-id/{id:guid}")]
        public async Task<IActionResult> GetServiceRequestById(Guid id)
        {
            return Ok(await _facadeService.ServiceRequestService.GetServiceRequestByIdAsync(id));
        }

        [HttpPost("create-service-request")]
        public async Task<IActionResult> CreateServiceRequest(
            [FromForm] ServiceRequestCreateRequestDto createRequest
        )
        {
            return Ok(
                await _facadeService.ServiceRequestService.CreateServiceRequestAsync(createRequest)
            );
        }

        [HttpPut("update-service-request")]
        public async Task<IActionResult> UpdateServiceRequest(
            [FromForm] ServiceRequestUpdateRequestDto updateRequest
        )
        {
            return Ok(
                await _facadeService.ServiceRequestService.UpdateServiceRequestAsync(updateRequest)
            );
        }

        [HttpDelete("delete-service-request/{id:guid}")]
        public async Task<IActionResult> DeleteServiceRequest(Guid id)
        {
            await _facadeService.ServiceRequestService.DeleteServiceRequestAsync(id);
            return NoContent();
        }
    }
}
