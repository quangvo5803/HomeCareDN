using BusinessLogic.DTOs.Application.Chat.User;
using BusinessLogic.DTOs.Application.Chat.User.ChatMessage;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [ApiController]
    [Route("api/chat-messages")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ChatMessagesController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ChatMessagesController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMessagesByConversationID(
            [FromQuery] ChatMessageGetByIdDto dto
        )
        {
            var result =
                await _facadeService.ChatMessageService.GetAllMessagesByConversationIDAsync(dto);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Customer,Contractor,Distributor,Admin")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequestDto dto)
        {
            var result = await _facadeService.ChatMessageService.SendMessageAsync(dto);
            return Ok(result);
        }

        [HttpPost("send-admin")]
        [Authorize(Roles = "Customer,Contractor,Distributor")]
        public async Task<IActionResult> SendMessageToAdmin([FromBody] SendMessageRequestDto dto)
        {
            var result = await _facadeService.ChatMessageService.SendMessageToAdminAsync(dto);
            return Ok(result);
        }
    }
}
