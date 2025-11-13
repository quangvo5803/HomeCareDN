using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Payment;
using BusinessLogic.Services.FacadeService;
using DataAccess.Entities;
using DataAccess.Entities.Payment;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public PaymentController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpPost("create-payment")]
        public async Task<IActionResult> CreatePayment([FromBody] PaymentCreateRequestDto request)
        {
            try
            {
                var result = await _facadeService.PaymentService.CreatePaymentAsync(request);
                return Ok(
                    new
                    {
                        code = 200,
                        message = "Tạo link thanh toán thành công",
                        result.checkoutUrl,
                        result.orderCode,
                    }
                );
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 500, message = ex.Message });
            }
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> WebhookPost([FromBody] PayOSCallbackDto callback)
        {
            await _facadeService.PaymentService.HandlePayOSCallbackAsync(callback);
            return Ok(new { message = "Cập nhật thanh toán thành công" });
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAllCommissions([FromQuery] QueryParameters parameters)
        {
            var result = await _facadeService.PaymentService.GetAllCommissionAsync(parameters);
            return Ok(result);
        }
    }
}
