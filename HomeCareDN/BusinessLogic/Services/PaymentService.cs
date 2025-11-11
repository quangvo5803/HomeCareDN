using System.Globalization;
using BusinessLogic.DTOs.Application.Payment;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.Entities.Payment;
using DataAccess.UnitOfWork;
using Microsoft.Extensions.Options;
using Microsoft.VisualBasic;
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
        private readonly ISignalRNotifier _notifier;

        public PaymentService(
            PayOS payOS,
            IUnitOfWork unitOfWork,
            IOptions<PayOsOptions> payOsOptions,
            ISignalRNotifier notifier
        )
        {
            _payOS = payOS;
            _unitOfWork = unitOfWork;
            _payOsOptions = payOsOptions.Value;
            _notifier = notifier;
        }

        public async Task<CreatePaymentResult> CreatePaymentAsync(
            PaymentCreateRequestDto requestDto
        )
        {
            var orderCode = DateTimeOffset.Now.ToUnixTimeMilliseconds();

            var items = new List<ItemData>
            {
                new ItemData(requestDto.ItemName ?? "Thanh toán", 1, (int)requestDto.Amount),
            };

            var baseUrl = _payOsOptions.BaseUrl;

            var cancelUrl =
                $"{baseUrl}/Contractor/service-request/{requestDto.ServiceRequestID}?status=cancelled";
            var returnUrl =
                $"{baseUrl}/Contractor/service-request/{requestDto.ServiceRequestID}?status=paid";

            var paymentData = new PaymentData(
                orderCode,
                (int)requestDto.Amount,
                requestDto.Description ?? "Thanh toán hoa hồng",
                items,
                cancelUrl: cancelUrl,
                returnUrl: returnUrl
            );

            var result = await _payOS.createPaymentLink(paymentData);

            var payment = new PaymentTransaction
            {
                ContractorApplicationID = requestDto.ContractorApplicationID,
                ServiceRequestID = requestDto.ServiceRequestID,
                Amount = requestDto.Amount,
                Description = requestDto.Description ?? "Thanh toán hoa hồng",
                ItemName = "Thanh toán",
                OrderCode = result.orderCode,
                CheckoutUrl = result.checkoutUrl,
                PaymentLinkID = result.paymentLinkId,
                Status = PaymentStatus.Pending,
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
                    new Dictionary<string, string[]> { { "Data", new[] { "Data not found" } } }
                );
            }
            var payment = await _unitOfWork.PaymentTransactionsRepository.GetAsync(
                p => p.OrderCode == data.OrderCode,
                includeProperties: "ContractorApplication",
                asNoTracking: false
            );

            if (payment == null)
            {
                return;
            }

            if (data.Code == "00")
            {
                payment.Status = PaymentStatus.Paid;
                if (payment.ContractorApplication != null)
                {
                    payment.ContractorApplication.Status = ApplicationStatus.Approved;
                    payment.ContractorApplication.DueCommisionTime = null;
                }
                if (
                    DateTime.TryParseExact(
                        data.TransactionDateTime,
                        "yyyy-MM-dd HH:mm:ss",
                        CultureInfo.InvariantCulture,
                        DateTimeStyles.None,
                        out var paidAt
                    )
                )
                {
                    payment.PaidAt = DateTime
                        .SpecifyKind(paidAt, DateTimeKind.Local)
                        .ToUniversalTime();
                }
                else
                {
                    payment.PaidAt = DateTime.UtcNow;
                }

                var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                    s => s.ServiceRequestID == payment.ServiceRequestID,
                    asNoTracking: false
                );
                if (serviceRequest != null && payment.ContractorApplication != null)
                {
                    var conversation = new Conversation
                    {
                        ConversationID = Guid.NewGuid(),
                        ServiceRequestID = serviceRequest.ServiceRequestID,
                        CustomerID = serviceRequest.CustomerID,
                        ContractorID = payment.ContractorApplication.ContractorID,
                        ConversationType = ConversationType.ServiceRequest,
                        CreatedAt = DateTime.UtcNow,
                    };
                    serviceRequest.ConversationID = conversation.ConversationID;
                    await _unitOfWork.ConversationRepository.AddAsync(conversation);
                    await _unitOfWork.SaveAsync();
                    await _notifier.SendToChatGroupAsync(
                        conversation.ConversationID.ToString(),
                        "Chat.ConversationUnlocked",
                        new { conversation.ConversationID }
                    );
                }

                await _notifier.SendToApplicationGroupAsync(
                    $"user_{serviceRequest?.CustomerID}",
                    "PaymentTransation.Updated",
                    new
                    {
                        payment.ContractorApplicationID,
                        Status = payment.Status.ToString(),
                        serviceRequest?.ConversationID,
                    }
                );
                await _notifier.SendToApplicationGroupAsync(
                    $"role_Admin",
                    "PaymentTransation.Updated",
                    new { payment.ContractorApplicationID, Status = payment.Status.ToString() }
                );
            }
            else
            {
                _unitOfWork.PaymentTransactionsRepository.Remove(payment);
            }

            await _unitOfWork.SaveAsync();
        }
    }
}
