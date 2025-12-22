using BusinessLogic.DTOs.Application.EKyc;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EKycsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;
        public EKycsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpPost]
        public async Task<IActionResult> VerifyEKyc([FromForm] EKycVerifyRequestDto request)
        {
            var ekycToken = await _facadeService.EKycService.VerifyAsync(request);
            return Ok(new { EkycToken = ekycToken });
        }
    }
}
