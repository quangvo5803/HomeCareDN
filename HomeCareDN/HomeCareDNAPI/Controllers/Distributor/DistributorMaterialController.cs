using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Distributor
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Distributor")]
    public partial class DistributorController : ControllerBase
    {
        private readonly IFacadeService _facadeService;
        public DistributorController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-material-by-id/{id:guid}")]
        public async Task<IActionResult> GetAllMaterialById(Guid id)
        {
            var rs = await _facadeService.MaterialService.GetAllMaterialByIdAsync(id);
            return Ok(rs);
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

        [HttpDelete("delete-material-image")]
        public async Task<IActionResult> DeleteMaterialImage([FromQuery] string imageUrl)
        {
            await _facadeService.MaterialService.DeleteMaterialImageAsync(imageUrl);
            return NoContent();
        }
    }
}
