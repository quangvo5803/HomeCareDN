using BusinessLogic.Services.FacadeService;
using DataAccess.Entities;
using DataAccess.Entities.Payment;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Payment
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
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
        {
            try
            {
                var result = await _facadeService.PaymentService.CreatePaymentAsync(request.Amount, request.Description!, request.ItemName!);

                return Ok(new
                {
                    code = 200,
                    message = "Tạo link thanh toán thành công",
                    checkoutUrl = result.checkoutUrl,
                    orderCode = result.orderCode
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 500, message = ex.Message });
            }
        }
    }
}
