using BusinessLogic.DTOs.Application.ServiceRequest;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceRequestsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ServiceRequestsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllHardServiceRequests()
        {
            var serviceRequests =
                await _facadeService.ServiceRequestService.GetAllHardServiceRequestsAsync();
            return Ok(serviceRequests);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetServiceRequestById(Guid id)
        {
            var serviceRequest =
                await _facadeService.ServiceRequestService.GetServiceRequestByIdAsync(id);
            if (serviceRequest == null)
            {
                return NotFound();
            }
            return Ok(serviceRequest);
        }

        [HttpPost]
        public async Task<IActionResult> CreateServiceRequest(
            ServiceRequestCreateRequestDto requestDto
        )
        {
            if (requestDto == null)
            {
                return BadRequest("Invalid service request data.");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var createdRequest =
                await _facadeService.ServiceRequestService.CreateServiceRequestAsync(requestDto);
            return CreatedAtAction(
                nameof(GetServiceRequestById),
                new { id = createdRequest.ServiceRequestID },
                createdRequest
            );
        }

        [HttpPut]
        public async Task<IActionResult> UpdateServiceRequest(
            ServiceRequestUpdateRequestDto requestDto
        )
        {
            if (requestDto == null)
            {
                return BadRequest("Invalid service request data.");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var updatedRequest =
                await _facadeService.ServiceRequestService.UpdateServiceRequestAsync(requestDto);
            return Ok(updatedRequest);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteServiceRequest(Guid id)
        {
            try
            {
                await _facadeService.ServiceRequestService.DeleteServiceRequestAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
