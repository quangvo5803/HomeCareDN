using BusinessLogic.DTOs.Application;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IFacadeService _facadeService;
        public UsersController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUserAsync([FromQuery] QueryParameters parameters)
        {
            var result = await _facadeService.UserService.GetAllUserAsync(parameters);
            return Ok(result);
        }
    }
}
