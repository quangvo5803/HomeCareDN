using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public MaterialController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-material")]
        public async Task<IActionResult> GetAllMaterial([FromQuery] QueryParameters parameters)
        {
            var rs = await _facadeService.MaterialService.GetAllMaterialAsync(parameters);
            return Ok(rs);
        }

        [HttpGet("get-material/{id:guid}")]
        public async Task<IActionResult> GetMaterialById(Guid id)
        {
            var rs = await _facadeService.MaterialService.GetMaterialByIdAsync(id);
            return Ok(rs);
        }
        [Authorize(
        AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
        Roles = "Distributor"
        )]
        [HttpGet("get-all-material-by-userid")]
        public async Task<IActionResult> GetAllMaterialByUserId(
            [FromQuery] QueryParameters parameters
        )
        {
            var rs = await _facadeService.MaterialService.GetAllMaterialByUserIdAsync(parameters);
            return Ok(rs);
        }

        [HttpGet("get-material-bycategory/{id:guid}")]
        public async Task<IActionResult> GetMaterialByCategory(Guid id)
        {
            var rs = await _facadeService.MaterialService.GetMaterialByCategoryAsync(id);
            return Ok(rs);
        }

        [HttpGet("get-material-bybrand/{id:guid}")]
        public async Task<IActionResult> GetMaterialByBrand(Guid id)
        {
            var rs = await _facadeService.MaterialService.GetMaterialByBrandAsync(id);
            return Ok(rs);
        }

        [Authorize(
        AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
        Roles = "Admin,Distributor"
        )]
        [HttpPost("create-material")]
        public async Task<IActionResult> CreateMaterial([FromForm] MaterialCreateRequestDto dto)
        {
            var rs = await _facadeService.MaterialService.CreateMaterialAsync(dto);
            return Ok(rs);
        }

        [Authorize(
        AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
        Roles = "Admin,Distributor"
        )]
        [HttpPut("update-material")]
        public async Task<IActionResult> UpdateMaterial([FromForm] MaterialUpdateRequestDto dto)
        {
            var rs = await _facadeService.MaterialService.UpdateMaterialAsync(dto);
            return Ok(rs);
        }

        [Authorize(
        AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
        Roles = "Admin,Distributor"
        )]
        [HttpDelete("delete-material/{id:guid}")]
        public async Task<IActionResult> DeleteMaterial(Guid id)
        {
            await _facadeService.MaterialService.DeleteMaterialAsync(id);
            return NoContent();
        }
    }
}
