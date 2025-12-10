using System.Threading.Tasks;
using BusinessLogic.DTOs.Application.Chat.Ai;
using BusinessLogic.DTOs.Application.ServiceRequest;
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
            var result = await _facadeService.AiChatService.ChatSupportAsync(dto);
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
        public async Task<IActionResult> Estimate(
            [FromBody] AIServiceRequestPredictionRequestDto dto
        )
        {
            const int maxRetry = 3;
            AiServiceRequestPredictionResponseDto result =
                new AiServiceRequestPredictionResponseDto();

            for (int attempt = 1; attempt <= maxRetry; attempt++)
            {
                result = await _facadeService.AiChatService.EstimatePriceAsync(dto);

                // Nếu AI trả về kết quả hợp lệ thì thoát vòng lặp
                if (
                    result?.SuggestedDescription != "AI did not return any result."
                    && result?.SuggestedDescription != "Invalid JSON returned by AI"
                )
                    break;

                // Nếu chưa phải lần cuối → chờ 0.3s rồi thử lại
                if (attempt < maxRetry)
                    await Task.Delay(300);
            }

            return Ok(result);
        }
    }
}
