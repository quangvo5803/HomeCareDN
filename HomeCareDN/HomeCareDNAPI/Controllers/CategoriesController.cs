using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.Services.FacadeService;
using DataAccess.Entities.Application;
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

        [HttpGet]
        public async Task<IActionResult> GetAllCategories([FromQuery] QueryParameters query)
        {
            var categories = await _facadeService.CategoryService.GetAllCategories(query);
            return Ok(categories);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetCategory(Guid id)
        {
            var category = await _facadeService.CategoryService.GetCategoryByIdAsync(id);
            return Ok(category);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Admin,Distributor"
        )]
        [HttpGet("check-category")]
        public async Task<IActionResult> CheckCategory(string name, Guid? categoryID = null)
        {
            var exists = await _facadeService.CategoryService.CheckCategoryExisiting(
                name,
                categoryID
            );
            return Ok(exists);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Admin,Distributor"
        )]
        [HttpPost]
        public async Task<IActionResult> CreateCategory(
            [FromBody] CategoryCreateRequestDto requestDto
        )
        {
            var category = await _facadeService.CategoryService.CreateCategoryAsync(requestDto);
            return Ok(category);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Admin,Distributor"
        )]
        [HttpPut]
        public async Task<IActionResult> UpdateCategory(
            [FromBody] CategoryUpdateRequestDto requestDto
        )
        {
            var category = await _facadeService.CategoryService.UpdateCategoryAsync(requestDto);
            return Ok(category);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Admin,Distributor"
        )]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            await _facadeService.CategoryService.DeleteCategoryAsync(id);
            return NoContent();
        }
    }
}
