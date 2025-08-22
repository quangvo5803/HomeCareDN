using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly IFacadeService _facadeService;
        public CategoryController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategory([FromQuery] CategoryGetAllRequestDto requestDto)
        {
            var category = await _facadeService.CategoryService.GetAllCategoryAsync(requestDto);
            return Ok(category);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(Guid id)
        {
            var category = await _facadeService.CategoryService.GetCategoryByIdAsync(id);

            if (category == null)
            {
                return NotFound();
            }
            return Ok(category);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategoryRequest([FromQuery] CategoryCreateRequestDto requestDto)
        {
            if (requestDto == null)
            {
                return BadRequest("Invalid material request data.");
            }

            var categoryRequest = await _facadeService.CategoryService.CreateCategoryAsync(requestDto);

            return CreatedAtAction(
                nameof(GetCategoryById),
                new { id = categoryRequest.CategoryID },
                requestDto
            );
        }

        [HttpPut]
        public async Task<IActionResult> UpdateCategoryRequest([FromQuery] CategoryUpdateRequestDto requestDto)
        {
            if (requestDto == null)
            {
                return BadRequest("Invalid material request data.");
            }

            var updatedRequest = await _facadeService.CategoryService.UpdateCategoryAsync(requestDto);

            return Ok(updatedRequest);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategoryRequest(Guid id)
        {
            try
            {
                await _facadeService.CategoryService.DeleteCategoryAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Category with ID {id} not found.");
            }
        }
    }
}
