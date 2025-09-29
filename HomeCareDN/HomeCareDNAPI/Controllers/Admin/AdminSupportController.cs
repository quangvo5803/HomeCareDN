using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ContactSupport;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Admin
{
    public class AdminSupportController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public AdminSupportController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-support")]
        public async Task<IActionResult> ListContactSupports([FromQuery] QueryParameters parameters)
        {
            var list = await _facadeService.ContactSupportService.ListAllAsync(parameters);
            return Ok(list);
        }

        [HttpPost("reply-support")]
        public async Task<IActionResult> ReplyContactSupport(
            [FromBody] ContactSupportReplyRequestDto dto
        )
        {
            var updated = await _facadeService.ContactSupportService.ReplyAsync(dto);

            return Ok(updated);
        }

        [HttpDelete("delete-support/{id:guid}")]
        public async Task<IActionResult> DeleteContactSupport(Guid id)
        {
            await _facadeService.ContactSupportService.DeleteAsync(id);
            return NoContent();
        }
    }
}
