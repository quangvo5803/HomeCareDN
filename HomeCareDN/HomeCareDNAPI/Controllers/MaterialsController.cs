using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public MaterialsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMaterials()
        {
            var materials = await _facadeService.MaterialService.GetAllHardMaterialAsync();
            return Ok(materials);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMaterialById(Guid id)
        {
            var material = await _facadeService.MaterialService.GetMaterialByIdAsync(id);
            if (material == null)
            {
                return NotFound();
            }
            return Ok(material);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMaterialRequest(MaterialCreateRequestDto requestDto)
        {
            if (requestDto == null)
            {
                return BadRequest("Invalid material request data.");
            }
            var createdRequest = await _facadeService.MaterialService.CreateMaterialAsync(
                requestDto
            );
            return CreatedAtAction(
                nameof(GetMaterialById),
                new { id = createdRequest.MaterialID },
                createdRequest
            );
        }

        [HttpPut]
        public async Task<IActionResult> UpdateMaterialRequest(MaterialUpdateRequestDto requestDto)
        {
            if (requestDto == null)
            {
                return BadRequest("Invalid material request data.");
            }
            var updatedRequest = await _facadeService.MaterialService.UpdateMaterialAsync(
                requestDto
            );
            return Ok(updatedRequest);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMaterialRequest(Guid id)
        {
            try
            {
                await _facadeService.MaterialService.DeleteMaterialAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Material with ID {id} not found.");
            }
        }
    }
}
