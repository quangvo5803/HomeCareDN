using BusinessLogic.DTOs.Application.Chat.Ai;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AiChatController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public AiChatController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpPost("send")]
        [AllowAnonymous]
        public async Task<IActionResult> Send([FromBody] AiChatRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Prompt))
                return BadRequest("PROMPT_REQUIRED");
            var result = await _facadeService.AiChatService.SendAsync(dto);
            return Ok(result);
        }

        [HttpGet("history")]
        [AllowAnonymous]
        public async Task<IActionResult> History()
        {
            var history = await _facadeService.AiChatService.GetHistoryAsync();
            return Ok(history);
        }

        [HttpDelete("history")]
        [AllowAnonymous]
        public async Task<IActionResult> Clear()
        {
            await _facadeService.AiChatService.ClearHistoryAsync();
            return NoContent();
        }
    }
}
