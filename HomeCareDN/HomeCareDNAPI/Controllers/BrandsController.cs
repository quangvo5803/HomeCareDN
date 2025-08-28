using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Http;
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
    }
}
