using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminMaterialController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public AdminMaterialController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpPost("create-material")]
        public async Task<IActionResult> CreateMaterial([FromForm] MaterialCreateRequestDto dto)
        {
            var rs = await _facadeService.MaterialService.CreateMaterialAsync(dto);
            return Ok(rs);
        }

        [HttpPut("update-material")]
        public async Task<IActionResult> UpdateMaterial([FromForm] MaterialUpdateRequestDto dto)
        {
            var rs = await _facadeService.MaterialService.UpdateMaterialAsync(dto);
            return Ok(rs);
        }

        [HttpDelete("delete-material/{id:guid}")]
        public async Task<IActionResult> DeleteMaterial(Guid id)
        {
            await _facadeService.MaterialService.DeleteMaterialAsync(id);
            return NoContent();
        }
    }
}
