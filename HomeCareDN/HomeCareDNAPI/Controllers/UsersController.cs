using BusinessLogic.DTOs.Application;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
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

        [HttpGet("{userID}")]
        public async Task<IActionResult> GetUserByIdAsync(string userID)
        {
            var result = await _facadeService.UserService.GetUserByIdAsync(userID);
            return Ok(result);
        }
    }
}
