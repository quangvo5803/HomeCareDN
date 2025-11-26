using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.Services.FacadeService;
using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public MaterialsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMaterial([FromQuery] QueryParameters parameters)
        {
            var materials = await _facadeService.MaterialService.GetAllMaterialAsync(parameters);
            return Ok(materials);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetMaterialById(Guid id)
        {
            var material = await _facadeService.MaterialService.GetMaterialByIdAsync(id);
            return Ok(material);
        }

        [HttpGet("users/materials")]
        public async Task<IActionResult> GetAllMaterialsByUserId(
            Guid userId,
            [FromQuery] QueryParameters parameters
        )
        {
            var rs = await _facadeService.MaterialService.GetAllMaterialByUserIdAsync(parameters);
            return Ok(rs);
        }

        [HttpGet("~/api/categories/{categoryID:guid}/materials")]
        public async Task<IActionResult> GetMaterialByCategory(Guid categoryID)
        {
            var materials = await _facadeService.MaterialService.GetMaterialByCategoryAsync(
                categoryID
            );
            return Ok(materials);
        }

        [HttpGet("~/api/brands/{brandID:guid}/materials")]
        public async Task<IActionResult> GetMaterialByBrand(Guid brandID)
        {
            var materials = await _facadeService.MaterialService.GetMaterialByBrandAsync(brandID);
            return Ok(materials);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Admin,Distributor"
        )]
        [HttpGet("check-material")]
        public async Task<IActionResult> CheckMaterial(string name, Guid? materialID = null)
        {
            var exists = await _facadeService.MaterialService.CheckMaterialExisiting(
                name,
                materialID
            );
            return Ok(exists); // true nếu tồn tại
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Admin,Distributor"
        )]
        [HttpPost]
        public async Task<IActionResult> CreateMaterial([FromBody] MaterialCreateRequestDto dto)
        {
            var rs = await _facadeService.MaterialService.CreateMaterialAsync(dto);
            return Ok(rs);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Admin,Distributor"
        )]
        [HttpPut]
        public async Task<IActionResult> UpdateMaterial([FromBody] MaterialUpdateRequestDto dto)
        {
            var rs = await _facadeService.MaterialService.UpdateMaterialAsync(dto);
            return Ok(rs);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Admin,Distributor"
        )]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteMaterial(Guid id)
        {
            await _facadeService.MaterialService.DeleteMaterialAsync(id);
            return NoContent();
        }
    }
}
