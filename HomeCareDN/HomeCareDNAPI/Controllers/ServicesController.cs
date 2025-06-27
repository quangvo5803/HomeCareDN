using BusinessLogic.DTOs.Application.Service;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ServicesController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllServices()
        {
            var service = await _facadeService.ServicesService.GetAllServiceAsync();
            return Ok(service);
        }

        [HttpPost]
        public async Task<IActionResult> CreateService(ServiceCreateDto serviceCreate)
        {
            if (serviceCreate == null) 
                return BadRequest("Invalid service request data.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createServiceRequest = await _facadeService.ServicesService.CreateServiceAsync(serviceCreate);

            return CreatedAtAction(
                nameof(GetServiceById),
                new { id = createServiceRequest.ServiceID },
                createServiceRequest
            );
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetServiceById(Guid id)
        {
            var serviceRequest = await _facadeService.ServicesService.GetServiceByIdAsync(id);
            if (serviceRequest == null) return BadRequest("Id Null");
            return Ok(serviceRequest);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateService(ServiceUpdateDto serviceUpdate)
        {
            if (serviceUpdate == null)
            {
                return BadRequest("Invalid service data.");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updateServiceRequest = await _facadeService.ServicesService.UpdateServiceAsync(serviceUpdate);
            return Ok(updateServiceRequest);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(Guid id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            await _facadeService.ServicesService.DeleteServiceAsync(id);
            return Ok();
        }

    }
}
