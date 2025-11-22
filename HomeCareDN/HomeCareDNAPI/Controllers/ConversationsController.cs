using System.Security.Claims;
using BusinessLogic.DTOs.Application.Chat.User.Convesation;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ConversationsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ConversationsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Customer,Contractor,Distributor")]
        public async Task<IActionResult> GetConversationByID(Guid id)
        {
            var result = await _facadeService.ConversationService.GetConversationByIDAsync(id);
            return Ok(result);
        }

        [HttpGet("user/{id}")]
        [Authorize(Roles = "Customer,Contractor,Distributor")]
        public async Task<IActionResult> GetConversationByUserID(string id)
        {
            var result = await _facadeService.ConversationService.GetConversationByUserIDAsync(id);
            return Ok(result);
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllConversationsByAdminID(
            [FromQuery] ConversationGetByIdDto dto
        )
        {
            var result = await _facadeService.ConversationService.GetAllConversationByAdminIDAsync(
                dto
            );
            return Ok(result);
        }

        [HttpPost("admin/mark-as-read/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            await _facadeService.ConversationService.MarkConversationAsReadAsync(id);
            return Ok();
        }

        [HttpGet("admin/get-unread-conversation/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUnreadConversationCount(string id)
        {
            var result =
                await _facadeService.ConversationService.CountUnreadConversationsByAdminIDAsync(id);
            return Ok(result);
        }
    }
}
