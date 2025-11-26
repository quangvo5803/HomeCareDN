using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Brand;
using BusinessLogic.Services.FacadeService;
using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BrandsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public BrandsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBrands([FromQuery] QueryParameters parameters)
        {
            var brands = await _facadeService.BrandService.GetAllBrands(parameters);
            return Ok(brands);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetBrand(Guid id)
        {
            var brand = await _facadeService.BrandService.GetBrandByID(id);
            return Ok(brand);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpGet("check-brand")]
        public async Task<IActionResult> CheckBrand(string name)
        {
            var exists = await _facadeService.BrandService.CheckBrandExisiting(name);
            return Ok(exists);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateBrand([FromBody] BrandCreateRequestDto dto)
        {
            var brand = await _facadeService.BrandService.CreateBrandAsync(dto);
            return Ok(brand);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpPut]
        public async Task<IActionResult> UpdateBrand([FromBody] BrandUpdateRequestDto dto)
        {
            var brand = await _facadeService.BrandService.UpdateBrandAsync(dto);
            return Ok(brand);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteBrand(Guid id)
        {
            await _facadeService.BrandService.DeleteBrandAsync(id);
            return NoContent();
        }
    }
}
