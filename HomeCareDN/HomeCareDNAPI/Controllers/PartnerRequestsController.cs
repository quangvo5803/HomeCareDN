using BusinessLogic.DTOs.Application.Partner;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;
using Ultitity.Exceptions;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartnerRequestsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public PartnerRequestsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpPost("create-partner-request")]
        public async Task<IActionResult> CreatePartner(
            [FromForm] PartnerRequestCreateRequestDto request
        )
        {
            var partner = await _facadeService.PartnerService.CreatePartnerRequestAsync(request);
            return Ok(partner);
        }
    }
}
