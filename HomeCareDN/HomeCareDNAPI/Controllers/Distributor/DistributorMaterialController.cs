using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Distributor
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(
        AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
        Roles = "Distributor"
    )]
    public class DistributorMaterialController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public DistributorMaterialController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-material-by-userid")]
        public async Task<IActionResult> GetAllMaterialByUserId(
            [FromQuery] QueryParameters parameters
        )
        {
            var rs = await _facadeService.MaterialService.GetAllMaterialByUserIdAsync(parameters);
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
    }
}
