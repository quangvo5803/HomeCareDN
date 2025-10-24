using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public class AdminCategoryController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public AdminCategoryController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpPost("create-category")]
        public async Task<IActionResult> CreateCategory(
            [FromForm] CategoryCreateRequestDto requestDto
        )
        {
            var category = await _facadeService.CategoryService.CreateCategoryAsync(requestDto);
            return Ok(category);
        }

        [HttpPut("update-category")]
        public async Task<IActionResult> UpdateCategory(
            [FromForm] CategoryUpdateRequestDto requestDto
        )
        {
            var category = await _facadeService.CategoryService.UpdateCategoryAsync(requestDto);
            return Ok(category);
        }

        [HttpDelete("delete-category/{id:guid}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            await _facadeService.CategoryService.DeleteCategoryAsync(id);
            return NoContent();
        }
    }
}
