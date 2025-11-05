using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ContactSupport;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/contactact-supports")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public class ContactactSupportsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ContactactSupportsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] QueryParameters parameters)
        {
            var list = await _facadeService.ContactSupportService.ListAllAsync(parameters);
            return Ok(list);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var item = await _facadeService.ContactSupportService.GetByIdAsync(id);
            return Ok(item);
        }

        [HttpPut("reply")]
        public async Task<IActionResult> ReplyContactSupport(
            [FromBody] ContactSupportReplyRequestDto dto
        )
        {
            var updated = await _facadeService.ContactSupportService.ReplyAsync(dto);

            return Ok(updated);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteContactSupport(Guid id)
        {
            await _facadeService.ContactSupportService.DeleteAsync(id);
            return NoContent();
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ContactSupportCreateRequestDto dto)
        {
            var created = await _facadeService.ContactSupportService.CreateAsync(dto);
            return Ok(created);
        }
    }
}
