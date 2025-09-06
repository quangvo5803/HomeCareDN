using System.Security.Claims;
using BusinessLogic.DTOs.Chat.User;
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
        private readonly IFacadeService _facade;
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        public ConversationsController(IFacadeService facade)
        {
            _facade = facade;
        }

        [HttpPost("start")]
        public async Task<IActionResult> Start([FromBody] StartConversationRequestDto dto) =>
            Ok(await _facade.ConversationService.StartConversationAsync(dto));

        [HttpGet("mine")]
        public async Task<IActionResult> Mine()
        {
            var list = await _facade.ConversationService.GetMyConversationsAsync(UserId);
            return Ok(list);
        }

        [HttpGet("{conversationId:guid}/messages")]
        public async Task<IActionResult> Messages(
            Guid conversationId,
            int page = 1,
            int pageSize = 50
        )
        {
            var items = await _facade.ConversationService.GetMessagesAsync(
                conversationId,
                page,
                pageSize
            );
            return Ok(items);
        }

        [HttpPost("{conversationId:guid}/send")]
        public async Task<IActionResult> Send(
            Guid conversationId,
            [FromBody] SendMessageRequestDto dto
        )
        {
            if (conversationId != dto.ConversationId)
                return BadRequest("CONVERSATION_MISMATCH");
            var msg = await _facade.ConversationService.SendMessageAsync(UserId, dto);
            return Ok(msg);
        }

        [HttpPost("{conversationId:guid}/read")]
        public async Task<IActionResult> MarkRead(Guid conversationId)
        {
            await _facade.ConversationService.MarkAsReadAsync(conversationId, UserId);
            return NoContent();
        }

        [HttpPost("{conversationId:guid}/close")]
        public async Task<IActionResult> Close(Guid conversationId)
        {
            await _facade.ConversationService.CloseConversationAsync(conversationId, UserId);
            return NoContent();
        }
    }
}
