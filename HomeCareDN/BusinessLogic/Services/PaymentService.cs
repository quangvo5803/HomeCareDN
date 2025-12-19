using System.Globalization;
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

        private const string PAYMENT = "PaymentTransaction.Updated";

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
            string cancelUrl = "";
            string returnUrl = "";

            switch (requestDto.Role)
            {
                case "Contractor":
                    cancelUrl =
                        $"{baseUrl}/Contractor/ServiceRequestManager/{requestDto.ServiceRequestID}?status=cancelled";
                    returnUrl =
                        $"{baseUrl}/Contractor/ServiceRequestManager/{requestDto.ServiceRequestID}?status=paid";
                    break;

                case "Distributor":
                    cancelUrl =
                        $"{baseUrl}/Distributor/MaterialRequestManager/{requestDto.MaterialRequestID}?status=cancelled";
                    returnUrl =
                        $"{baseUrl}/Distributor/MaterialRequestManager/{requestDto.MaterialRequestID}?status=paid";
                    break;

                default:
                    var errors = new Dictionary<string, string[]>
                    {
                        {
                            "Role",
                            new[] { "Role must be 'Contractor' or 'Distributor' not found" }
                        },
                    };
                    throw new CustomValidationException(errors);
            }

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
                ContractorApplicationID =
                    requestDto.Role == "Contractor" ? requestDto.ContractorApplicationID : null,
                ServiceRequestID =
                    requestDto.Role == "Contractor" ? requestDto.ServiceRequestID : null,

                DistributorApplicationID =
                    requestDto.Role == "Distributor" ? requestDto.DistributorApplicationID : null,
                MaterialRequestID =
                    requestDto.Role == "Distributor" ? requestDto.MaterialRequestID : null,

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
                includeProperties: "ContractorApplication,DistributorApplication",
                asNoTracking: false
            );

            if (payment == null)
            {
                return;
            }

            bool isContractorPayment = payment.ContractorApplicationID != null;
            bool isDistributorPayment = payment.DistributorApplicationID != null;

            if (data.Code == "00")
            {
                payment.Status = PaymentStatus.Paid;

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
                    payment.PaidAt = DateTime.SpecifyKind(paidAt.AddHours(-7), DateTimeKind.Local);
                }
                else
                {
                    payment.PaidAt = DateTime.UtcNow;
                }

                var tasks = new List<Task>();
                if (isContractorPayment)
                    tasks.Add(HandleContractorPaymentAsync(payment));
                if (isDistributorPayment)
                    tasks.Add(HandleDistributorPaymentAsync(payment));

                await Task.WhenAll(tasks);
            }
            else
            {
                _unitOfWork.PaymentTransactionsRepository.Remove(payment);
            }

            await _unitOfWork.SaveAsync();
        }

        public async Task<PagedResultDto<PaymentTransactionDto>> GetAllCommissionAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork.PaymentTransactionsRepository.GetQueryable(
                includeProperties: "ContractorApplication",
                asNoTracking: true
            );

            query = query.Where(p => p.Status == PaymentStatus.Paid);

            if (!string.IsNullOrEmpty(parameters.Search))
            {
                query = query.Where(u =>
                    u.OrderCode.ToString().Contains(parameters.Search)
                    || u.Description.Contains(parameters.Search)
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

        private async Task HandleContractorPaymentAsync(PaymentTransaction payment)
        {
            var contractorApp = payment.ContractorApplication;

            contractorApp!.Status = ApplicationStatus.Approved;
            contractorApp.DueCommisionTime = null;

            var contractor = await _userManager.FindByIdAsync(
                contractorApp.ContractorID.ToString()
            );
            if (contractor != null)
            {
                contractor.ProjectCount += 1;
                UpdateProjectScaleAndBaseReputation(contractor, contractorApp.EstimatePrice);
                await _userManager.UpdateAsync(contractor);
            }

            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                s => s.ServiceRequestID == payment.ServiceRequestID,
                asNoTracking: false
            );

            if (serviceRequest != null)
            {
                var conversation = new Conversation
                {
                    ConversationID = Guid.NewGuid(),
                    ServiceRequestID = serviceRequest.ServiceRequestID,
                    CustomerID = serviceRequest.CustomerID.ToString(),
                    ContractorID = contractorApp.ContractorID.ToString(),
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
                PAYMENT,
                new
                {
                    payment.ContractorApplicationID,
                    Status = payment.Status.ToString(),
                    StartReviewDate = payment.PaidAt!.Value.AddMinutes(2),
                    serviceRequest?.ConversationID,
                }
            );
            var payload = new
            {
                payment.ContractorApplicationID,
                payment.ServiceRequestID,
                payment.PaymentTransactionID,
                payment.OrderCode,
                payment.Amount,
                payment.Description,
                payment.PaidAt,
                Status = payment.Status.ToString(),
            };
            await _notifier.SendToApplicationGroupAsync($"role_Admin", PAYMENT, payload);
            await _notificationService.NotifyPersonalAsync(
                new NotificationPersonalCreateOrUpdateDto
                {
                    TargetUserId = serviceRequest!.CustomerID,
                    Title = "Yêu cầu của bạn đã được chấp thuận",
                    Message = "Bạn và nhà thầu đã sẵn sàng để bắt đầu công việc.",
                    TitleEN = "Your request has been approved",
                    MessageEN = "You and your contractor are ready to begin work.",
                    DataKey = $"ContractorApplication_{payment.ContractorApplicationID}_PAID",
                    DataValue = serviceRequest.ServiceRequestID.ToString(),
                    Action = NotificationAction.Paid,
                }
            );
        }

        private async Task HandleDistributorPaymentAsync(PaymentTransaction payment)
        {
            var distributorApp = payment.DistributorApplication;

            distributorApp!.Status = ApplicationStatus.Approved;
            distributorApp.DueCommisionTime = null;

            var distributor = await _userManager.FindByIdAsync(
                distributorApp.DistributorID.ToString()
            );
            if (distributor != null)
            {
                distributor.ProjectCount += 1;
                UpdateProjectScaleAndBaseReputation(distributor, distributorApp.TotalEstimatePrice);
                await _userManager.UpdateAsync(distributor);
            }

            var materialRequest = await _unitOfWork.MaterialRequestRepository.GetAsync(
                s => s.MaterialRequestID == payment.MaterialRequestID,
                asNoTracking: false
            );

            if (materialRequest != null)
            {
                var conversation = new Conversation
                {
                    ConversationID = Guid.NewGuid(),
                    MaterialRequestID = materialRequest.MaterialRequestID,
                    CustomerID = materialRequest.CustomerID.ToString(),
                    DistributorID = distributorApp.DistributorID.ToString(),
                    ConversationType = ConversationType.MaterialRequest,
                    CreatedAt = DateTime.UtcNow,
                };

                materialRequest.ConversationID = conversation.ConversationID;
                await _unitOfWork.ConversationRepository.AddAsync(conversation);
                await _unitOfWork.SaveAsync();

                await _notifier.SendToChatGroupAsync(
                    conversation.ConversationID.ToString(),
                    "Chat.ConversationUnlocked",
                    new { conversation.ConversationID }
                );
            }
            await _notifier.SendToApplicationGroupAsync(
                $"user_{materialRequest!.CustomerID}",
                PAYMENT,
                new
                {
                    payment.DistributorApplicationID,
                    Status = payment.Status.ToString(),
                    StartReviewDate = payment.PaidAt!.Value.AddMinutes(2),
                    materialRequest.ConversationID,
                }
            );
            var payload = new
            {
                payment.DistributorApplicationID,
                payment.MaterialRequestID,
                payment.PaymentTransactionID,
                payment.OrderCode,
                payment.Amount,
                payment.Description,
                payment.PaidAt,
                Status = payment.Status.ToString(),
            };
            await _notifier.SendToApplicationGroupAsync($"role_Admin", PAYMENT, payload);
            await _notificationService.NotifyPersonalAsync(
                new NotificationPersonalCreateOrUpdateDto
                {
                    TargetUserId = materialRequest!.CustomerID,
                    Title = "Yêu cầu của bạn đã được chấp thuận",
                    Message = $"Bạn và nhà phân phối đã sẵn sàng để bắt đầu công việc.",
                    TitleEN = "Your request has been approved",
                    MessageEN = "You and your distributor are ready to begin work.",
                    DataKey = $"DistributorApplication_{payment.DistributorApplicationID}_PAID",
                    DataValue = materialRequest.MaterialRequestID.ToString(),
                    Action = NotificationAction.Paid,
                }
            );
        }

        private static void UpdateProjectScaleAndBaseReputation(ApplicationUser partner, double projectValue)
        {
            if (projectValue <= 1_000_000_000)
            {
                partner.SmallScaleProjectCount += 1;
            }
            else if (projectValue <= 10_000_000_000)
            {
                partner.MediumScaleProjectCount += 1;
            }
            else
            {
                partner.LargeScaleProjectCount += 1;
            }

            int basePoints = projectValue switch
            {
                <= 1_000_000_000 => 1,
                <= 10_000_000_000 => 5,
                _ => 10
            };
            partner.ReputationPoints += basePoints;
        }
    }
}
