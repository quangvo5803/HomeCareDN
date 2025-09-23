using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ServiceRequest;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Customer
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Customer")]
    public partial class CustomerController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public CustomerController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }


        [HttpGet("get-all-servicerequest-byuserid")]
        public async Task<IActionResult> GetAllServiceRequestByUserId([FromQuery] QueryParameters parameters)
        {
            return Ok(await _facadeService.ServiceRequestService.GetAllServiceRequestByUserIdAsync(parameters));
        }

        [HttpPost("create-servicerequest")]
        public async Task<IActionResult> CreateServiceRequest (ServiceRequestCreateRequestDto createRequest)
        {
            return Ok(await _facadeService.ServiceRequestService
                .CreateServiceRequestAsync(createRequest)
            );
        }

        [HttpPut("update-servicerequest")]
        public async Task<IActionResult> UpdateServiceRequest(ServiceRequestUpdateRequestDto updateRequest)
        {
            return Ok(await _facadeService.ServiceRequestService
                .UpdateServiceRequestAsync(updateRequest)
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
