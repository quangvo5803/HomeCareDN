using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Partner;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public class AdminPartnerRequestController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public AdminPartnerRequestController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-partner-requests")]
        public async Task<IActionResult> GetAllPartners([FromQuery] QueryParameters parameters)
        {
            var result = await _facadeService.PartnerService.GetAllPartnerRequestsAsync(parameters);
            return Ok(result);
        }

        [HttpGet("get-partner-request/{id:guid}")]
        public async Task<IActionResult> GetPartnerById(Guid id)
        {
            var partner = await _facadeService.PartnerService.GetPartnerRequestByIdAsync(id);
            return Ok(partner);
        }

        [HttpPut("approve-partner-request/{id:guid}")]
        public async Task<IActionResult> ApprovePartner(Guid id)
        {
            var partner = await _facadeService.PartnerService.ApprovePartnerRequestAsync(id);
            return Ok(partner);
        }

        [HttpPut("reject-partner-request")]
        public async Task<IActionResult> RejectPartner([FromBody] RejectPartnerRequestDto request)
        {
            var partner = await _facadeService.PartnerService.RejectPartnerRequestAsync(request);
            return Ok(partner);
        }

        [HttpDelete("delete-partner-request/{id:guid}")]
        public async Task<IActionResult> DeletePartner(Guid id)
        {
            await _facadeService.PartnerService.DeletePartnerRequestAsync(id);
            return NoContent();
        }
    }
}
