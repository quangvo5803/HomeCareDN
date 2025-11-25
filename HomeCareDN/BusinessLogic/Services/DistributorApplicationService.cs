using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.DTOs.Application.DistributorApplication;
using BusinessLogic.DTOs.Application.MaterialRequest;
using BusinessLogic.DTOs.Application.Notification;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Contracts;
using Ultitity.Exceptions;
using static System.Net.Mime.MediaTypeNames;

namespace BusinessLogic.Services
{
    public class DistributorApplicationService : IDistributorApplicationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ISignalRNotifier _notifier;
        private readonly INotificationService _notificationService;

        private const string DISTRIBUTOR_APPLICATION_REJECT = "DistributorApplication.Rejected";
        private const string DISTRIBUTOR_APPLICATION_ACCEPT = "DistributorApplication.Accept";

        private const string ERROR_APPLICATION_NOT_FOUND = "APPLICATION_NOT_FOUND";
        private const string DISTRIBUTOR_APPLICATION = "DistributorApplication";
        private const string DISTRIBUTOR = "Distributor";
        private const string ERROR_MATERIAL_REQUEST_NOT_FOUND = "MATERIAL_REQUEST_NOT_FOUND";
        private const string ERROR_DISTRIBUTOR_NOT_FOUND = "DISTRIBUTOR_NOT_FOUND";
        private const string INCLUDE =
            "Items,Items.Material,Items.Material.Brand,Items.Material.Category,Items.Material.Images";

        public DistributorApplicationService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            UserManager<ApplicationUser> userManager,
            ISignalRNotifier notifier,
            INotificationService notificationService
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userManager = userManager;
            _notifier = notifier;
            _notificationService = notificationService;
        }

        public async Task<
            PagedResultDto<DistributorApplicationDto>
        > GetAllDistributorApplicationByMaterialRequestId(
            QueryParameters parameters,
            string role = "Customer"
        )
        {
            var query = _unitOfWork
                .DistributorApplicationRepository.GetQueryable(includeProperties: INCLUDE)
                .Where(x => x.MaterialRequestID == parameters.FilterID);

            var totalCount = await query.CountAsync();

            query = query
                .OrderBy(d => d.CreatedAt)
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

            var items = await query.ToListAsync();
            var dtoItems = _mapper.Map<IEnumerable<DistributorApplicationDto>>(items);

            foreach (var dto in dtoItems)
            {
                dto.Message = string.Empty;

                var distributor = await _userManager.FindByIdAsync(dto.DistributorID.ToString());
                if (distributor == null)
                    continue;

                if (role == "Admin")
                {
                    dto.DistributorName =
                        distributor.FullName ?? distributor.UserName ?? string.Empty;
                    dto.DistributorEmail = distributor.Email ?? string.Empty;
                    dto.DistributorPhone = distributor.PhoneNumber ?? string.Empty;
                }
            }

            return new PagedResultDto<DistributorApplicationDto>
            {
                Items = dtoItems,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<
            PagedResultDto<DistributorApplicationDto>
        > GetAllDistributorApplicationByUserIdAsync(QueryParameters parameters)
        {
            var query = _unitOfWork
                .DistributorApplicationRepository.GetQueryable(includeProperties: "MaterialRequest")
                .Where(ca => ca.DistributorID == parameters.FilterID);

            var totalCount = await query.CountAsync();
            query = query.OrderByDescending(c => c.CreatedAt);

            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

            var items = await query.ToListAsync();
            var dtos = _mapper.Map<IEnumerable<DistributorApplicationDto>>(items);

            return new PagedResultDto<DistributorApplicationDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<DistributorApplicationDto?> GetDistributorApplicationByMaterialRequestId(
            DistributorApplicationGetByIdDto byIdDto
        )
        {
            var distributorApplication =
                await _unitOfWork.DistributorApplicationRepository.GetAsync(
                    d =>
                        d.DistributorID == byIdDto.DistributorID
                        && d.MaterialRequestID == byIdDto.MaterialRequestID,
                    includeProperties: INCLUDE
                );

            if (distributorApplication == null)
            {
                return null;
            }

            var dto = _mapper.Map<DistributorApplicationDto>(distributorApplication);

            var distributor = await _userManager.FindByIdAsync(
                distributorApplication.DistributorID.ToString()
            );

            if (distributor is not null)
            {
                dto.CompletedProjectCount = distributor.ProjectCount;
                dto.DistributorName = distributor.FullName ?? distributor.UserName ?? "";
                dto.DistributorEmail = distributor.Email ?? "";
                dto.DistributorPhone = distributor.PhoneNumber ?? "";
            }
            return dto;
        }

        public async Task<DistributorApplicationDto> GetDistributorApplicationById(
            Guid id,
            string role = "Customer"
        )
        {
            var application = await _unitOfWork.DistributorApplicationRepository.GetAsync(
                a => a.DistributorApplicationID == id,
                includeProperties: INCLUDE
            );

            if (application == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { DISTRIBUTOR, new[] { ERROR_DISTRIBUTOR_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            var dto = _mapper.Map<DistributorApplicationDto>(application);
            var distributor = await _userManager.FindByIdAsync(
                application.DistributorID.ToString()
            );

            if (distributor != null)
            {
                dto.CompletedProjectCount = distributor.ProjectCount;
                dto.AverageRating = distributor.AverageRating;

                if (role == "Customer" && application.Status == ApplicationStatus.Approved)
                {
                    dto.DistributorName =
                        distributor.FullName ?? distributor.UserName ?? string.Empty;
                    dto.DistributorEmail = distributor.Email ?? string.Empty;
                    dto.DistributorPhone = distributor.PhoneNumber ?? string.Empty;
                }
            }
            return dto;
        }

        public async Task<DistributorApplicationDto> CreateDistributorApplicationAsync(
            DistributorCreateApplicationDto createRequest
        )
        {
            var materialRequestTask = _unitOfWork.MaterialRequestRepository.GetAsync(
                m => m.MaterialRequestID == createRequest.MaterialRequestID,
                includeProperties: "MaterialRequestItems"
            );
            var distributorTask = _userManager.FindByIdAsync(
                createRequest.DistributorID.ToString()
            );

            await Task.WhenAll(materialRequestTask, distributorTask);
            var materialRequest = materialRequestTask.Result;
            var distributor = distributorTask.Result;

            if (materialRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { DISTRIBUTOR_APPLICATION, new[] { ERROR_MATERIAL_REQUEST_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            if (distributor == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { DISTRIBUTOR, new[] { ERROR_DISTRIBUTOR_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            DistributorApplication application;

            application = await AddAndNoCase(createRequest, materialRequest);

            var dto = _mapper.Map<DistributorApplicationDto>(application);
            dto.DistributorName = distributor.FullName ?? string.Empty;
            dto.DistributorEmail = distributor.Email ?? string.Empty;
            dto.DistributorPhone = distributor.PhoneNumber ?? string.Empty;
            dto.Status = ApplicationStatus.Pending.ToString();

            var customerDto = _mapper.Map<DistributorApplicationDto>(application);
            dto.DistributorName = string.Empty;
            dto.DistributorEmail = string.Empty;
            dto.DistributorPhone = string.Empty;
            customerDto.Status = ApplicationStatus.Pending.ToString();

            var notifyTasks = new List<Task>
            {
                _notifier.SendToApplicationGroupAsync(
                    $"role_Admin",
                    "DistributorApplication.Created",
                    dto
                ),
                _notifier.SendToApplicationGroupAsync(
                    $"user_{materialRequest.CustomerID}",
                    "DistributorApplication.Created",
                    customerDto
                ),
            };
            await _notificationService.NotifyPersonalAsync(new NotificationPersonalCreateOrUpdateDto
            {
                TargetUserId = materialRequest.CustomerID,
                Title = "Nhà thầu mới đăng ký yêu cầu dịch vụ",
                Message = $"Nhà thầu mới đã đăng ký xử lý yêu cầu dịch vụ của bạn",
                DataKey = $"ContractorApplication_{dto.DistributorApplicationID}_APPLY",
                DataValue = dto.MaterialRequestID.ToString(),
                Action = NotificationAction.Apply
            });
            await Task.WhenAll(notifyTasks);
            return dto;
        }

        public async Task DeleteDistributorApplicationAsync(Guid id)
        {
            var application = await _unitOfWork.DistributorApplicationRepository.GetAsync(
                a => a.DistributorApplicationID == id,
                asNoTracking: false
            );
            if (application == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { DISTRIBUTOR_APPLICATION, new[] { ERROR_MATERIAL_REQUEST_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            var materialRequest = await _unitOfWork.MaterialRequestRepository.GetAsync(
                m => m.MaterialRequestID == application.MaterialRequestID,
                asNoTracking: false
            );
            _unitOfWork.DistributorApplicationRepository.Remove(application);

            await _notifier.SendToApplicationGroupAsync(
                $"user_{materialRequest?.CustomerID}",
                "DistributorApplication.Delete",
                new { application.MaterialRequestID, application.DistributorApplicationID }
            );
            await _notifier.SendToApplicationGroupAsync(
                $"role_Admin",
                "DistributorApplication.Delete",
                new { application.MaterialRequestID, application.DistributorApplicationID }
            );
            await _unitOfWork.SaveAsync();
        }

        #region Handle Cases
        private async Task<DistributorApplication> AddAndNoCase(
            DistributorCreateApplicationDto createRequest,
            MaterialRequest request
        )
        {
            var application = _mapper.Map<DistributorApplication>(createRequest);
            application.Items = new List<DistributorApplicationItem>();

            foreach (var item in createRequest.Items!)
            {
                var reqItem = request.MaterialRequestItems!.FirstOrDefault(x =>
                    x.MaterialID == item.MaterialID
                );

                var entityItem = _mapper.Map<DistributorApplicationItem>(item);

                // quantity từ vật liệu cũ
                if (reqItem != null)
                {
                    entityItem.Quantity = reqItem.Quantity;
                }
                application.Items.Add(entityItem);
            }

            await _unitOfWork.DistributorApplicationRepository.AddAsync(application);
            await _unitOfWork.SaveAsync();
            return application;
        }

        public async Task<DistributorApplicationDto> AcceptDistributorApplicationAsync(
            DistributorApplicationAcceptRequestDto dto
        )
        {
            var application = await _unitOfWork.DistributorApplicationRepository.GetAsync(
                x => x.DistributorApplicationID == dto.DistributorApplicationID,
                includeProperties: "Items",
                asNoTracking: false
            );
            if (application == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { DISTRIBUTOR_APPLICATION, new[] { ERROR_APPLICATION_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            var request = await _unitOfWork.MaterialRequestRepository.GetAsync(
                x => x.MaterialRequestID == application.MaterialRequestID,
                includeProperties: "MaterialRequestItems,DistributorApplications",
                asNoTracking: false
            );
            if (request == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "MaterialRequest", new[] { "Material request not found." } },
                };
                throw new CustomValidationException(errors);
            }
            var originalMaterialIDs =
                request.MaterialRequestItems?.Select(x => x.MaterialID).ToHashSet()
                ?? new HashSet<Guid>();

            if (application.Items != null && dto.AcceptedExtraItemIDs != null)
            {
                var originalItems = application
                    .Items.Where(x => originalMaterialIDs.Contains(x.MaterialID))
                    .ToList();

                var extraItems = application
                    .Items.Where(x => !originalMaterialIDs.Contains(x.MaterialID))
                    .ToList();

                var acceptedExtraItems = extraItems
                    .Where(x => dto.AcceptedExtraItemIDs.Contains(x.DistributorApplicationItemID))
                    .ToList();

                application.Items = originalItems.Concat(acceptedExtraItems).ToList();
            }
            application.Status = ApplicationStatus.PendingCommission;
            application.DueCommisionTime = DateTime.UtcNow.AddDays(7);

            request.Status = RequestStatus.Closed;
            request.SelectedDistributorApplicationID = application.DistributorApplicationID;
            if (request.DistributorApplications != null)
            {
                foreach (var other in request.DistributorApplications)
                {
                    if (other.DistributorApplicationID != application.DistributorApplicationID)
                    {
                        other.Status = ApplicationStatus.Rejected;

                        var rejectPayload = new
                        {
                            other.DistributorApplicationID,
                            request.MaterialRequestID,
                            Status = "Rejected",
                        };

                        await _notifier.SendToApplicationGroupAsync(
                            $"user_{other.DistributorID}",
                            DISTRIBUTOR_APPLICATION_REJECT,
                            rejectPayload
                        );
                    }
                }
            }
            await _unitOfWork.SaveAsync();
            var resultDto = _mapper.Map<DistributorApplicationDto>(application);

            var acceptPayload = new
            {
                application.DistributorApplicationID,
                application.MaterialRequestID,
                Status = "PendingCommission",
                application.DueCommisionTime,
            };
            await _notifier.SendToApplicationGroupAsync(
                $"user_{request.CustomerID}",
                DISTRIBUTOR_APPLICATION_ACCEPT,
                acceptPayload
            );
            await _notifier.SendToApplicationGroupAsync(
                $"user_{application.DistributorID}",
                DISTRIBUTOR_APPLICATION_ACCEPT,
                acceptPayload
            );
            await _notifier.SendToApplicationGroupAsync(
                $"role_Admin",
                DISTRIBUTOR_APPLICATION_ACCEPT,
                acceptPayload
            );

            return resultDto;
        }

        public async Task<DistributorApplicationDto> RejectDistributorApplicationAsync(
            Guid distributorApplicationID
        )
        {
            var distributorApplication =
                await _unitOfWork.DistributorApplicationRepository.GetAsync(
                    ca => ca.DistributorApplicationID == distributorApplicationID,
                    asNoTracking: false
                );

            if (distributorApplication == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { DISTRIBUTOR_APPLICATION, new[] { ERROR_APPLICATION_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            if (distributorApplication.Status != ApplicationStatus.Pending)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { DISTRIBUTOR_APPLICATION, new[] { "APPLICATION_NOT_PENDING" } },
                };
                throw new CustomValidationException(errors);
            }

            distributorApplication.Status = ApplicationStatus.Rejected;
            await _unitOfWork.SaveAsync();
            var dto = _mapper.Map<DistributorApplicationDto>(distributorApplication);
            await _notifier.SendToApplicationGroupAsync(
                $"user_{dto.DistributorID}",
                DISTRIBUTOR_APPLICATION_REJECT,
                new
                {
                    distributorApplication.DistributorApplicationID,
                    distributorApplication.MaterialRequestID,
                    Status = ApplicationStatus.Rejected.ToString(),
                }
            );
            await _notifier.SendToApplicationGroupAsync(
                $"role_Admin",
                DISTRIBUTOR_APPLICATION_REJECT,
                new
                {
                    distributorApplication.DistributorApplicationID,
                    distributorApplication.MaterialRequestID,
                    Status = ApplicationStatus.Rejected.ToString(),
                }
            );
            return dto;
        }
        #endregion
    }
}
