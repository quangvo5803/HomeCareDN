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

        [HttpPost("chat")]
        [AllowAnonymous]
        public async Task<IActionResult> Chat([FromBody] AiChatRequestDto dto)
        {
            var result = await _facadeService.AiChatService.ChatSupportAsync(dto.Prompt);
            return Ok(result);
        }

        [HttpPost("suggest")]
        [AllowAnonymous]
        public async Task<IActionResult> Suggest([FromBody] AiChatRequestDto dto)
        {
            var result = await _facadeService.AiChatService.SuggestSearchAsync(dto.Prompt);
            return Ok(result);
        }

        [HttpPost("estimate")]
        [AllowAnonymous]
        public async Task<IActionResult> Estimate([FromBody] AiEstimateRequestDto dto)
        {
            var result = await _facadeService.AiChatService.EstimatePriceAsync(dto);
            return Ok(new { estimate = result });
        }
    }
}
