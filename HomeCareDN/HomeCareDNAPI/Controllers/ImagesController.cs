using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ImagesController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ImagesController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteImage([FromQuery] string imageUrl)
        {
            await _facadeService.ImageService.DeleteImageAsync(imageUrl);
            return NoContent();
        }
    }
}
