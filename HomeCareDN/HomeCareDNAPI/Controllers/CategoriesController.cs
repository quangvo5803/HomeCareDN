using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
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

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Admin,Distributor"
        )]
        [HttpPost("create-category")]
        public async Task<IActionResult> CreateCategory(
            [FromForm] CategoryCreateRequestDto requestDto
        )
        {
            var category = await _facadeService.CategoryService.CreateCategoryAsync(requestDto);
            return Ok(category);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Admin,Distributor"
        )]
        [HttpPut("update-category")]
        public async Task<IActionResult> UpdateCategory(
            [FromForm] CategoryUpdateRequestDto requestDto
        )
        {
            var category = await _facadeService.CategoryService.UpdateCategoryAsync(requestDto);
            return Ok(category);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Admin,Distributor"
        )]
        [HttpDelete("delete-category/{id:guid}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            await _facadeService.CategoryService.DeleteCategoryAsync(id);
            return NoContent();
        }
    }
}
