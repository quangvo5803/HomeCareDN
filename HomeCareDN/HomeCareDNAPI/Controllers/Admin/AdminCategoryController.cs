using BusinessLogic.DTOs.Application.Category;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Admin
{
    public partial class AdminController : ControllerBase
    {
        [HttpPost("create-category")]
        public async Task<IActionResult> CreateCategory(
            [FromBody] CategoryCreateRequestDto requestDto
        )
        {
            var category = await _facadeService.CategoryService.CreateCategoryAsync(requestDto);
            return Ok(category);
        }

        [HttpPut("update-category")]
        public async Task<IActionResult> UpdateCategory(
            [FromBody] CategoryUpdateRequestDto requestDto
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
