using BusinessLogic.DTOs.Application.ContactSupport;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Admin
{
    public partial class AdminController : ControllerBase
    {
        [HttpGet("support/list")]
        public async Task<IActionResult> ListContactSupports([FromQuery] bool? isProcessed = null)
        {
            var list = await _facadeService.ContactSupportService.ListAllAsync(isProcessed);
            return Ok(list);
        }

        [HttpPost("support/reply")]
        public async Task<IActionResult> ReplyContactSupport([FromBody] ContactSupportReplyRequestDto dto)
        {
            var updated = await _facadeService.ContactSupportService.ReplyAsync(dto);

            return Ok(updated);
        }

        [HttpDelete("support/delete/{id:guid}")]
        public async Task<IActionResult> DeleteContactSupport(Guid id)
        {
            await _facadeService.ContactSupportService.DeleteAsync(id);
            return NoContent();
        }
    }
}
