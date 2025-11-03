using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Partner;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [ApiController]
    [Route("api/partner-requests")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class PartnerRequestsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public PartnerRequestsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllPartners([FromQuery] QueryParameters parameters)
        {
            var result = await _facadeService.PartnerService.GetAllPartnerRequestsAsync(parameters);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetPartnerById(Guid id)
        {
            var partner = await _facadeService.PartnerService.GetPartnerRequestByIdAsync(id);
            return Ok(partner);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:guid}/approve")]
        public async Task<IActionResult> ApprovePartner(Guid id)
        {
            var partner = await _facadeService.PartnerService.ApprovePartnerRequestAsync(id);
            return Ok(partner);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("reject")]
        public async Task<IActionResult> RejectPartner([FromBody] RejectPartnerRequestDto request)
        {
            var partner = await _facadeService.PartnerService.RejectPartnerRequestAsync(request);
            return Ok(partner);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeletePartner(Guid id)
        {
            await _facadeService.PartnerService.DeletePartnerRequestAsync(id);
            return NoContent();
        }

        [AllowAnonymous]
        [HttpPost("create-partner-request")]
        public async Task<IActionResult> CreatePartner(
            [FromBody] PartnerRequestCreateRequestDto request
        )
        {
            var partner = await _facadeService.PartnerService.CreatePartnerRequestAsync(request);
            return Ok(partner);
        }
    }
}
