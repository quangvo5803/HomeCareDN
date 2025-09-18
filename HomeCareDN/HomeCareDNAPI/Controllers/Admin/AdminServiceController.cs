using BusinessLogic.DTOs.Application.Service;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Admin
{
    public partial class AdminController : ControllerBase
    {
        [HttpPost("create-service")]
        public async Task<IActionResult> CreateService([FromForm] ServiceCreateRequestDto dto)
        {
            var service = await _facadeService.ServiceService.CreateServiceAsync(dto);
            return Ok(service);
        }

        [HttpPut("update-service")]
        public async Task<IActionResult> UpdateService([FromForm] ServiceUpdateRequestDto dto)
        {
            var service = await _facadeService.ServiceService.UpdateServiceAsync(dto);
            return Ok(service);
        }

        [HttpDelete("delete-service/{id:guid}")]
        public async Task<IActionResult> DeleteService(Guid id)
        {
            await _facadeService.ServiceService.DeleteServiceAsync(id);
            return NoContent();
        }
    }
}
