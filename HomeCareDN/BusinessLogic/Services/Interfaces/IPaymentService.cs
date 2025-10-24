using BusinessLogic.DTOs.Application.Payment;
using BusinessLogic.DTOs.Application.ServiceRequest;
using DataAccess.Entities.Payment;
using Net.payOS.Types;

namespace BusinessLogic.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<CreatePaymentResult> CreatePaymentAsync(PaymentCreateRequestDto requestDto);
        Task HandlePayOSCallbackAsync(PayOSCallbackDto callback);
    }
}
