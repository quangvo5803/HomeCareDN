using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Notification;
using BusinessLogic.Services.FacadeService;
using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;
        public NotificationsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("Customer")]
        public async Task<IActionResult> GetAllForCustomer([FromQuery] QueryParameters parameters)
        {
            return Ok(await _facadeService.NotificationService
                .GetAllNotificationsAsync(parameters, "Customer")
            );
        }

        [HttpGet("admin")]
        public async Task<IActionResult> CreateOrUpdateSystemForAdmin(
                [FromQuery] NotificationSystemCreateOrUpdateDto createDto)
        {
            return Ok(await _facadeService.NotificationService
                .AdminSendSystemAsync(createDto)
            );
        }

        [HttpGet("Contractor")]
        public async Task<IActionResult> GetAllForContractor([FromQuery] QueryParameters parameters)
        {
            return Ok(await _facadeService.NotificationService
                .GetAllNotificationsAsync(parameters, "Contractor")
            );
        }

        [HttpGet("Distributor")]
        public async Task<IActionResult> GetAllForDistributor([FromQuery] QueryParameters parameters)
        {
            return Ok(await _facadeService.NotificationService
                .GetAllNotificationsAsync(parameters, "Distributor")
            );
        }
    }
}
