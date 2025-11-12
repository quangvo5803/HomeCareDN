using System.Security.Claims;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(
        AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
        Roles = "Customer,Contractor"
    )]
    public class ConversationsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ConversationsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetConversationByID(Guid id)
        {
            var result = await _facadeService.ConversationService.GetConversationByIDAsync(id);
            return Ok(result);
        }

        [HttpGet("user/{id:guid}")]
        public async Task<IActionResult> GetConversationByUserID(Guid id)
        {
            var result = await _facadeService.ConversationService.GetConversationByUserIDAsync(id);
            return Ok(result);
        }

        [HttpGet("admin/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllConversationsByAdminID(Guid id)
        {
            var result = await _facadeService.ConversationService.GetAllConversationByAdminIDAsync(
                id
            );
            return Ok(result);
        }
    }
}
