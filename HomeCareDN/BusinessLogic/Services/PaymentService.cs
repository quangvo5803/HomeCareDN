using BusinessLogic.DTOs.Application.Payment;
using BusinessLogic.Services.FacadeService;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.Entities.Payment;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Net.payOS;
using Net.payOS.Types;
using Ultitity.Exceptions;
using Ultitity.Options;

namespace BusinessLogic.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly PayOS _payOS;
        private readonly IUnitOfWork _unitOfWork;
        private readonly PayOsOptions _payOsOptions;
        public PaymentService(PayOS payOS, IUnitOfWork unitOfWork, IOptions<PayOsOptions> payOsOptions)

        {
            _payOS = payOS;
            _unitOfWork = unitOfWork;
            _payOsOptions = payOsOptions.Value;
        }

        public async Task<CreatePaymentResult> CreatePaymentAsync(PaymentCreateRequestDto requestDto)
        {
            var orderCode = DateTimeOffset.Now.ToUnixTimeMilliseconds();

            var items = new List<ItemData>
            {
                new ItemData(requestDto.ItemName ?? "Thanh toán", 1, (int)requestDto.Amount)
            };

            var baseUrl = _payOsOptions.BaseUrl;

            var paymentData = new PaymentData(
                orderCode,
                (int)requestDto.Amount,
                requestDto.Description ?? "Thanh toán hoa hồng",
                items,
                cancelUrl: $"{baseUrl}/Contractor",
                returnUrl: $"{baseUrl}/Contractor/service-request/{requestDto.ServiceRequestID}"
            );

            var result = await _payOS.createPaymentLink(paymentData);

            var payment = new PaymentTransaction
            {
                ContractorApplicationID = requestDto.ContractorApplicationID,
                ServiceRequestID = requestDto.ServiceRequestID,
                Amount = requestDto.Amount,
                Description = requestDto.Description ?? "Thanh toán hoa hồng",
                ItemName =  "Thanh toán",
                OrderCode = result.orderCode,
                CheckoutUrl = result.checkoutUrl,
                PaymentLinkID = result.paymentLinkId,
                Status = PaymentStatus.Pending
            };

            await _unitOfWork.PaymentTransactionsRepository.AddAsync(payment);
            await _unitOfWork.SaveAsync();

            return result;
        }

        public async Task HandlePayOSCallbackAsync(PayOSCallbackDto callback)
        {
            var data = callback.Data;
            if (data == null)
            {
                throw new CustomValidationException(
                   new Dictionary<string, string[]>
                   {
                        { "Data", new[] { "Data not found" } },
                   }
                );
            }
            var payment = await _unitOfWork.PaymentTransactionsRepository
                .GetAsync(p => p.OrderCode == data.OrderCode, includeProperties: "ContractorApplication");

            if (payment == null)
            {
                throw new CustomValidationException(
                   new Dictionary<string, string[]>
                   {
                        { "OrderCodeNull", new[] { "ERROR_SERVICE_NOT_FOUND" } },
                   }
               );
            }   

            if (data.Code == "00")
            {
                payment.Status = PaymentStatus.Paid;
                if (DateTime.TryParse(data.TransactionDateTime, out var paidAt))
                {
                    payment.PaidAt = DateTime.SpecifyKind(paidAt, DateTimeKind.Utc);
                }
                else
                {
                    payment.PaidAt = DateTime.UtcNow;
                }
            }
            else
            {
                payment.Status = PaymentStatus.Failed;
            }

            await _unitOfWork.SaveAsync();
        }

    }
}
