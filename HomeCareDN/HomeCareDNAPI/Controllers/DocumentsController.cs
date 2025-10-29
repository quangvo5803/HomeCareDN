using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public DocumentsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        //[HttpDelete("delete-document")]
        //public async Task<IActionResult> DeleteDocument([FromQuery] string documentUrl)
        //{
        //    await _facadeService.DocumentService.DeleteDocumentAsync(documentUrl);
        //    return NoContent();
        //}
    }
}
