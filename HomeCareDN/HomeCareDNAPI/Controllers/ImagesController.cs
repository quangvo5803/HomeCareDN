using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ImagesController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpDelete("delete-image")]
        public async Task<IActionResult> DeleteImage([FromQuery] string imageUrl)
        {
            await _facadeService.ImageService.DeleteImageAsync(imageUrl);
            return NoContent();
        }
    }
}
