using BusinessLogic.DTOs.Application.Brand;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public partial class AdminController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public AdminController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-brands")]
        public async Task<IActionResult> GetAllBrands()
        {
            var brands = await _facadeService.BrandService.GetAllBrands();
            return Ok(brands);
        }

        [HttpGet("get-brand/{id:guid}")]
        public async Task<IActionResult> GetBrand(Guid id)
        {
            var brand = await _facadeService.BrandService.GetBrandByID(id);
            return Ok(brand);
        }

        [HttpPost("create-brand")]
        public async Task<IActionResult> CreateBrand([FromForm] BrandCreateRequestDto dto)
        {
            var brand = await _facadeService.BrandService.CreateBrandAsync(dto);
            return Ok(brand);
        }

        [HttpPut("update-brand")]
        public async Task<IActionResult> UpdateBrand([FromForm] BrandUpdateRequestDto dto)
        {
            var brand = await _facadeService.BrandService.UpdateBrandAsync(dto);
            return Ok(brand);
        }

        [HttpDelete("delete-brand/{id:guid}")]
        public async Task<IActionResult> DeleteBrand(Guid id)
        {
            await _facadeService.BrandService.DeleteBrandAsync(id);
            return NoContent();
        }
    }
}
