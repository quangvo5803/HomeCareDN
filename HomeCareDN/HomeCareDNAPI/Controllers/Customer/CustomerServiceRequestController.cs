using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ServiceRequest;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Customer
{
    public partial class CustomerController : ControllerBase
    {
        [HttpGet("get-all-servicerequest-byuserid")]
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

        [HttpPost("create-servicerequest")]
        public async Task<IActionResult> CreateServiceRequest(
            [FromForm] ServiceRequestCreateRequestDto createRequest
        )
        {
            return Ok(
                await _facadeService.ServiceRequestService.CreateServiceRequestAsync(createRequest)
            );
        }

        [HttpPut("update-servicerequest")]
        public async Task<IActionResult> UpdateServiceRequest(
            [FromForm] ServiceRequestUpdateRequestDto updateRequest
        )
        {
            return Ok(
                await _facadeService.ServiceRequestService.UpdateServiceRequestAsync(updateRequest)
            );
        }

        [HttpDelete("delete-servicerequest/{id:guid}")]
        public async Task<IActionResult> DeleteServiceRequest(Guid id)
        {
            await _facadeService.ServiceRequestService.DeleteServiceRequestAsync(id);
            return NoContent();
        }
    }
}
