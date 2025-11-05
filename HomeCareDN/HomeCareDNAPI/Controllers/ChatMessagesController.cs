using BusinessLogic.DTOs.Application.Chat.User;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(
        AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
        Roles = "Customer,Contractor"
    )]
    public class ChatMessagesController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ChatMessagesController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetMessagesByConversation(Guid id)
        {
            var result =
                await _facadeService.ChatMessageService.GetAllMessagesByConversationIdAsync(id);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequestDto dto)
        {
            var result = await _facadeService.ChatMessageService.SendMessageAsync(dto);
            return Ok(result);
        }
    }
}
