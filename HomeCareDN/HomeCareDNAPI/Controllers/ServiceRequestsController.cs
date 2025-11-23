using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ServiceRequest;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/service-requests")]
    [ApiController]
    public class ServiceRequestsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ServiceRequestsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        // ====================== ADMIN ======================
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllForAdmin([FromQuery] QueryParameters parameters)
        {
            var result = await _facadeService.ServiceRequestService.GetAllServiceRequestAsync(
                parameters
            );
            return Ok(result);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpGet("admin/detail")]
        public async Task<IActionResult> GetByIdForAdmin(
            [FromQuery] ServiceRequestGetByIdDto getByIdDto
        )
        {
            var result = await _facadeService.ServiceRequestService.GetServiceRequestByIdAsync(
                getByIdDto
            );
            return Ok(result);
        }

        // ====================== CUSTOMER ======================
        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Customer"
        )]
        [HttpGet("customer/all")]
        public async Task<IActionResult> GetAllForCustomer([FromQuery] QueryParameters parameters)
        {
            var result =
                await _facadeService.ServiceRequestService.GetAllServiceRequestByUserIdAsync(
                    parameters
                );
            return Ok(result);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Customer"
        )]
        [HttpGet("customer/detail")]
        public async Task<IActionResult> GetByIdForCustomer(
            [FromQuery] ServiceRequestGetByIdDto getByIdDto
        )
        {
            var result = await _facadeService.ServiceRequestService.GetServiceRequestByIdAsync(
                getByIdDto,
                "Customer"
            );
            return Ok(result);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Customer"
        )]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ServiceRequestCreateRequestDto dto)
        {
            var result = await _facadeService.ServiceRequestService.CreateServiceRequestAsync(dto);
            return Ok(result);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Customer"
        )]
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] ServiceRequestUpdateRequestDto dto)
        {
            var result = await _facadeService.ServiceRequestService.UpdateServiceRequestAsync(dto);
            return Ok(result);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Customer"
        )]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _facadeService.ServiceRequestService.DeleteServiceRequestAsync(id);
            return NoContent();
        }

        // ====================== CONTRACTOR ======================
        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Contractor"
        )]
        [HttpGet("contractor/all")]
        public async Task<IActionResult> GetAllForContractor(
            [FromQuery] QueryParameters parameters
        )
        {
            var result = await _facadeService.ServiceRequestService.GetAllServiceRequestAsync(
                parameters,
                "Contractor"
            );
            return Ok(result);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Contractor"
        )]
        [HttpGet("contractor/detail")]
        public async Task<IActionResult> GetByIdForContractor(
            [FromQuery] ServiceRequestGetByIdDto getByIdDto
        )
        {
            var result = await _facadeService.ServiceRequestService.GetServiceRequestByIdAsync(
                getByIdDto,
                "Contractor"
            );
            return Ok(result);
        }
    }
}
