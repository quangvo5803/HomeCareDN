using BusinessLogic.DTOs.Application;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public CategoriesController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("get-all-categories")]
        public async Task<IActionResult> GetAllCategories([FromQuery] QueryParameters query)
        {
            var categories = await _facadeService.CategoryService.GetAllCategories(query);
            return Ok(categories);
        }

        [HttpGet("get-category/{id:guid}")]
        public async Task<IActionResult> GetCategory(Guid id)
        {
            var category = await _facadeService.CategoryService.GetCategoryByIdAsync(id);
            return Ok(category);
        }
    }
}
