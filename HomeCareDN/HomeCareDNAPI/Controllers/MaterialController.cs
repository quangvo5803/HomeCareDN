using BusinessLogic.DTOs.Application;
using BusinessLogic.Services.FacadeService;
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
    }
}
