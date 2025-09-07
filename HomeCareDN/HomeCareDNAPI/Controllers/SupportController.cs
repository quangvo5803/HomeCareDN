using BusinessLogic.DTOs.Application.ContactSupport;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupportController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public SupportController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] ContactSupportCreateRequestDto dto)
        {
            var created = await _facadeService.ContactSupportService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var item = await _facadeService.ContactSupportService.GetDetailByIdAsync(id);
            return Ok(item); 
        }
    }
}
