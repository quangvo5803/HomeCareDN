using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Notification;
using BusinessLogic.DTOs.Application.Payment;
using BusinessLogic.DTOs.Authorize.User;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using DataAccess.Entities.Payment;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.VisualBasic;
using Net.payOS;
using Net.payOS.Types;
using System.Globalization;
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
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;

        public PaymentService(
            PayOS payOS,
            IUnitOfWork unitOfWork,
            IOptions<PayOsOptions> payOsOptions,
            ISignalRNotifier notifier,
            UserManager<ApplicationUser> userManager,
            IMapper mapper,
            INotificationService notificationService
        )
        {
            _payOS = payOS;
            _unitOfWork = unitOfWork;
            _payOsOptions = payOsOptions.Value;
            _notifier = notifier;
            _userManager = userManager;
            _mapper = mapper;
            _notificationService = notificationService;
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
                $"{baseUrl}/Contractor/ServiceRequestManager/{requestDto.ServiceRequestID}?status=cancelled";
            var returnUrl =
                $"{baseUrl}/Contractor/ServiceRequestManager/{requestDto.ServiceRequestID}?status=paid";

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

                    var contractorID = payment.ContractorApplication.ContractorID;
                    var contractor = await _userManager.FindByIdAsync(contractorID.ToString());
                    if (contractor != null)
                    {
                        contractor.ProjectCount += 1;
                        await _userManager.UpdateAsync(contractor);
                    }
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
                        CustomerID = serviceRequest.CustomerID.ToString(),
                        ContractorID = payment.ContractorApplication.ContractorID.ToString(),
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
                        StartReviewDate = payment.PaidAt.Value.AddMinutes(5),
                        serviceRequest?.ConversationID,
                    }
                );
                await _notifier.SendToApplicationGroupAsync(
                    $"role_Admin",
                    "PaymentTransation.Updated",
                    new { payment.ContractorApplicationID, Status = payment.Status.ToString() }
                );
                await _notificationService.NotifyPersonalAsync(new NotificationPersonalCreateOrUpdateDto
                {
                    TargetUserId = serviceRequest!.CustomerID,
                    Title = "Yêu cầu của bạn đã được chấp thuận",
                    Message = $"Bạn và nhà thầu đã sẵn sàng để bắt đầu công việc.",
                    DataKey = $"ContractorApplication_{payment.ContractorApplicationID}_PAID",
                    Action = NotificationAction.Paid
                });
            }
            else
            {
                _unitOfWork.PaymentTransactionsRepository.Remove(payment);
            }

            await _unitOfWork.SaveAsync();
        }

        public async Task<PagedResultDto<PaymentTransactionDto>> GetAllCommissionAsync(QueryParameters parameters)
        {
            var query = _unitOfWork.PaymentTransactionsRepository.GetQueryable(
                includeProperties:"ContractorApplication",
                asNoTracking: true
            );

            query = query.Where(p => p.Status == PaymentStatus.Paid);

            if (!string.IsNullOrEmpty(parameters.Search))
            {
                query = query.Where(u => 
                    u.OrderCode.ToString().Contains(parameters.Search) ||
                    u.Description.Contains(parameters.Search)
                );
            }

            var totalCount = await query.CountAsync();

            query = parameters.SortBy?.ToLower() switch
            {
                "paidat" => query.OrderBy(u => u.PaidAt),
                "paidatdesc" => query.OrderByDescending(u => u.PaidAt),
                _ => query.OrderBy(u => u.PaymentTransactionID),
            };

            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);
                
            var payments = await query.ToListAsync();
            var dtos = _mapper.Map<IEnumerable<PaymentTransactionDto>>(payments);

            return new PagedResultDto<PaymentTransactionDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }
    }
}
