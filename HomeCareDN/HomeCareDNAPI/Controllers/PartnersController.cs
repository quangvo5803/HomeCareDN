using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Partner;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ultitity.Exceptions;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public class PartnersController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public PartnersController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-partners")]
        public async Task<IActionResult> GetAllPartners([FromQuery] QueryParameters parameters)
        {
            try
            {
                var result = await _facadeService.PartnerService.GetAllPartnersAsync(parameters);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("get-partner/{id:guid}")]
        public async Task<IActionResult> GetPartnerById(Guid id)
        {
            try
            {
                var partner = await _facadeService.PartnerService.GetPartnerByIdAsync(id);
                return Ok(partner);
            }
            catch (CustomValidationException ex)
            {
                return BadRequest(ex.Errors);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpPost("create-partner")]
        public async Task<IActionResult> CreatePartner([FromForm] PartnerCreateRequest request)
        {
            try
            {
                var partner = await _facadeService.PartnerService.CreatePartnerAsync(request);
                return Ok(partner);
            }
            catch (CustomValidationException ex)
            {
                return BadRequest(ex.Errors);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("approve-partner")]
        public async Task<IActionResult> ApprovePartner([FromBody] PartnerApproveRequest request)
        {
            try
            {
                var partner = await _facadeService.PartnerService.ApprovePartnerAsync(request);
                return Ok(partner);
            }
            catch (CustomValidationException ex)
            {
                return BadRequest(ex.Errors);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("reject-partner")]
        public async Task<IActionResult> RejectPartner([FromBody] PartnerRejectRequest request)
        {
            try
            {
                var partner = await _facadeService.PartnerService.RejectPartnerAsync(request);
                return Ok(partner);
            }
            catch (CustomValidationException ex)
            {
                return BadRequest(ex.Errors);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("delete-partner/{id:guid}")]
        public async Task<IActionResult> DeletePartner(Guid id)
        {
            try
            {
                await _facadeService.PartnerService.DeletePartnerAsync(id);
                return NoContent();
            }
            catch (CustomValidationException ex)
            {
                return BadRequest(ex.Errors);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
