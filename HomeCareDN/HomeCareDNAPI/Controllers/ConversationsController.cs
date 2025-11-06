using BusinessLogic.DTOs.Application.Chat.User;
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

        [HttpPost]
        public async Task<IActionResult> CreateConversation(
            [FromBody] ConversationCreateRequestDto dto
        )
        {
            var result = await _facadeService.ConversationService.CreateConversationAsync(dto);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetConversationByID(Guid id)
        {
            var result = await _facadeService.ConversationService.GetConversationByIdAsync(id);
            return Ok(result);
        }
    }
}
