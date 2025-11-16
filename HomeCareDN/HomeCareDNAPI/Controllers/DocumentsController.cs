using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class DocumentsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public DocumentsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteDocument([FromQuery] string documentUrl)
        {
            await _facadeService.DocumentService.DeleteDocumentAsync(documentUrl);
            return NoContent();
        }
    }
}
