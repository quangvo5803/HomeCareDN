using BusinessLogic.DTOs.Application.Partner;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;
using Ultitity.Exceptions;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartnersController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public PartnersController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

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
    }
}
