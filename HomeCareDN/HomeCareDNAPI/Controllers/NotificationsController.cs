using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Notification;
using BusinessLogic.Services.FacadeService;
using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
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

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Customer")]
        [HttpGet("Customer")]
        public async Task<IActionResult> GetAllForCustomer([FromQuery] QueryParameters parameters)
        {
            return Ok(await _facadeService.NotificationService
                .GetAllNotificationsAsync(parameters, "Customer")
            );
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpGet("Admin")]
        public async Task<IActionResult> CreateOrUpdateSystemForAdmin(
                [FromQuery] NotificationSystemCreateOrUpdateDto createDto)
        {
            return Ok(await _facadeService.NotificationService
                .AdminSendSystemAsync(createDto)
            );
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Contractor")]
        [HttpGet("Contractor")]
        public async Task<IActionResult> GetAllForContractor([FromQuery] QueryParameters parameters)
        {
            return Ok(await _facadeService.NotificationService
                .GetAllNotificationsAsync(parameters, "Contractor")
            );
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Distributor")]
        [HttpGet("Distributor")]
        public async Task<IActionResult> GetAllForDistributor([FromQuery] QueryParameters parameters)
        {
            return Ok(await _facadeService.NotificationService
                .GetAllNotificationsAsync(parameters, "Distributor")
            );
        }

        [HttpPut("{id:guid}/read")]
        public async Task<IActionResult> ReadNotification(Guid id)
        {
            var noti = await _facadeService.NotificationService.ReadNotificationAsync(id);
            if(noti == null)
                return NotFound();
            return Ok(noti);
        }

        [HttpPut("{userId:guid}/read-all")]
        public async Task<IActionResult> ReadAllNotifications(Guid userId)
        {
            await _facadeService.NotificationService.ReadAllNotificationsAsync(userId);
            return Ok();
        }
    }
}
