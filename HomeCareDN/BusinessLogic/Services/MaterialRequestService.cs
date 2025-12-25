using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.DistributorApplication;
using BusinessLogic.DTOs.Application.DistributorApplication.Items;
using BusinessLogic.DTOs.Application.MaterialRequest;
using BusinessLogic.DTOs.Application.Payment;
using BusinessLogic.DTOs.Application.ServiceRequest;
using BusinessLogic.DTOs.Authorize.User;
using BusinessLogic.Services.Interfaces;
using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class MaterialRequestService : IMaterialRequestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly AuthorizeDbContext _authorizeDbContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ISignalRNotifier _notifier;
        private readonly INotificationService _notificationService;

        private const string ADMIN = "Admin";
        private const string DISTRIBUTOR = "Distributor";
        private const string INCLUDE_DELETE = "MaterialRequestItems,DistributorApplications";
        private const string INCLUDE =
            "MaterialRequestItems,MaterialRequestItems.Material,MaterialRequestItems.Material.Brand,MaterialRequestItems.Material.Category,MaterialRequestItems.Material.Images,DistributorApplications,SelectedDistributorApplication,SelectedDistributorApplication.Items,SelectedDistributorApplication.Items.Material,SelectedDistributorApplication,SelectedDistributorApplication.Items,SelectedDistributorApplication.Items.Material.Brand,SelectedDistributorApplication,SelectedDistributorApplication.Items,SelectedDistributorApplication,SelectedDistributorApplication.Items,SelectedDistributorApplication.Items.Material,Conversation,Review,Review.Images";
        private const string ERROR_MATERIAL_SERVICE = "MATERIAL_SERVICE";
        private const string ERROR_MATERIAL_SERVICE_NOT_FOUND = "MATERIAL_SERVICE_NOT_FOUND";

        public MaterialRequestService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            AuthorizeDbContext authorizeDbContext,
            UserManager<ApplicationUser> userManager,
            ISignalRNotifier notifier,
            INotificationService notificationService
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _authorizeDbContext = authorizeDbContext;
            _userManager = userManager;
            _notifier = notifier;
            _notificationService = notificationService;
        }

        public async Task<PagedResultDto<MaterialRequestDto>> GetAllMaterialRequestsAsync(
            QueryParameters parameters,
            string role = "Admin"
        )
        {
            var query = _unitOfWork.MaterialRequestRepository.GetQueryable(
                includeProperties: INCLUDE
            );
            query = query.Where(s =>
                s.Status == RequestStatus.Opening || s.Status == RequestStatus.Closed
            );

            if (parameters.FilterID != null && role == ADMIN)
            {
                query = query.Where(s => s.CustomerID == parameters.FilterID);
            }

            if (parameters.FilterID != null && role == DISTRIBUTOR)
            {
                query = query.Where(s =>
                    s.DistributorApplications != null
                    && s.DistributorApplications.Any(x => x.DistributorID == parameters.FilterID)
                );
            }

            var totalCount = await query.CountAsync();

            query = parameters.SortBy?.ToLower() switch
            {
                "createdat" => query.OrderBy(sr => sr.CreatedAt),
                "createdat_desc" => query.OrderByDescending(sr => sr.CreatedAt),
                _ => query.OrderByDescending(sr => sr.CreatedAt),
            };

            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

            var items = await query.ToListAsync();
            var dtos = _mapper.Map<IEnumerable<MaterialRequestDto>>(items);
            await MapMaterialRequestListAllAsync(items, dtos, role);
            return new PagedResultDto<MaterialRequestDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        private async Task MapMaterialRequestListAllAsync(
            IEnumerable<MaterialRequest> items,
            IEnumerable<MaterialRequestDto> dtos,
            string? role = ADMIN
        )
        {
            var itemDict = items.ToDictionary(i => i.MaterialRequestID);
            var materialRequestIds = itemDict.Keys.ToList();

            var addressIds = items
                .Where(i => i.AddressId.HasValue)
                .Select(i => i.AddressId!.Value)
                .Distinct()
                .ToList();

            var addresses = await _authorizeDbContext
                .Addresses.Where(a => addressIds.Contains(a.AddressID))
                .ToListAsync();

            var addressDict = addresses.ToDictionary(a => a.AddressID);

            foreach (var dto in dtos)
            {
                // --- Address mapping ---
                if (
                    dto.AddressID.HasValue
                    && addressDict.TryGetValue(dto.AddressID.Value, out var address)
                )
                {
                    dto.Address = _mapper.Map<AddressDto>(address);

                    if (role == DISTRIBUTOR)
                    {
                        dto.Address.Detail = string.Empty;
                        dto.Address.Ward = string.Empty;
                    }
                }
                if (role == "Customer" && dto.Review == null)
                {
                    await MapStartReviewDateForCustomerListAll(dto);
                }
            }
        }

        private async Task MapStartReviewDateForCustomerListAll(MaterialRequestDto dto)
        {
            if (dto.SelectedDistributorApplication?.Status == ApplicationStatus.Approved.ToString())
            {
                var contractorPayment = await _unitOfWork.PaymentTransactionsRepository.GetAsync(
                    cp => cp.MaterialRequestID == dto.MaterialRequestID
                );
                if (contractorPayment != null && contractorPayment.PaidAt.HasValue)
                {
                    dto.StartReviewDate = contractorPayment.PaidAt.Value.AddMinutes(2);
                }
            }
        }

        public async Task<PagedResultDto<MaterialRequestDto>> GetAllMaterialRequestByUserIdAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork
                .MaterialRequestRepository.GetQueryable(includeProperties: INCLUDE)
                .Where(m => m.CustomerID == parameters.FilterID);
            var totalCount = await query.CountAsync();

            query = parameters.SortBy?.ToLower() switch
            {
                "createdat" => query.OrderBy(sr => sr.CreatedAt),
                "createdat_desc" => query.OrderByDescending(sr => sr.CreatedAt),
                _ => query.OrderByDescending(sr => sr.CreatedAt),
            };

            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

            var items = await query.ToListAsync();
            var dtos = _mapper.Map<IEnumerable<MaterialRequestDto>>(items);
            await MapMaterialRequestListAllAsync(items, dtos, "Customer");

            return new PagedResultDto<MaterialRequestDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<MaterialRequestDto> GetMaterialRequestByIdAsync(
            MaterialRequestGetByIdDto getByIdDto,
            string role = "Admin"
        )
        {
            var materialRequest = await _unitOfWork.MaterialRequestRepository.GetAsync(
                m => m.MaterialRequestID == getByIdDto.MaterialRequestID,
                includeProperties: INCLUDE
            );
            if (materialRequest == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ERROR_MATERIAL_SERVICE, new[] { ERROR_MATERIAL_SERVICE_NOT_FOUND } },
                    }
                );
            }
            var dto = _mapper.Map<MaterialRequestDto>(materialRequest);
            await MapMaterialRequestDetailAsync(
                materialRequest!,
                dto,
                role,
                getByIdDto.DistributorID
            );
            return dto;
        }

        private async Task MapMaterialRequestDetailAsync(
            MaterialRequest item,
            MaterialRequestDto dto,
            string role = ADMIN,
            Guid? currentDistributorId = null
        )
        {
            // Map address chung
            await MapAddressAsync(item, dto, role, currentDistributorId);

            dto.DistributorApplyCount = item.DistributorApplications?.Count ?? 0;

            switch (role)
            {
                case ADMIN:
                    await MapForAdminAsync(item, dto);
                    break;
                case "Customer":
                    await MapForCustomerAsync(item, dto);
                    break;
                case DISTRIBUTOR:
                    await MapForDistributorAsync(item, dto, currentDistributorId);
                    break;
            }
        }

        // ==================== Map Address ====================
        private async Task MapAddressAsync(
            MaterialRequest item,
            MaterialRequestDto dto,
            string role,
            Guid? currentDistributorId
        )
        {
            if (role == DISTRIBUTOR)
            {
                var address = await _authorizeDbContext.Addresses.FirstOrDefaultAsync(a =>
                    a.AddressID == item.AddressId
                );
                if (address != null)
                    dto.Address = _mapper.Map<AddressDto>(address);
                bool showAddress =
                    item.Status == RequestStatus.Closed
                    && item.SelectedDistributorApplication?.DistributorID == currentDistributorId
                    && item.SelectedDistributorApplication?.Status == ApplicationStatus.Approved;

                if (!showAddress && dto.Address != null)
                {
                    dto.Address.Detail = string.Empty;
                    dto.Address.Ward = string.Empty;
                }
            }
            else
            {
                var address = await _authorizeDbContext.Addresses.FirstOrDefaultAsync(a =>
                    a.AddressID == item.AddressId
                );
                if (address != null)
                {
                    dto.Address = _mapper.Map<AddressDto>(address);
                }
            }
        }

        // ==================== Admin ====================
        private async Task MapForAdminAsync(MaterialRequest item, MaterialRequestDto dto)
        {
            var customer = await _userManager.FindByIdAsync(item.CustomerID.ToString());
            if (customer != null)
            {
                dto.CustomerName = customer.FullName ?? customer.Email;
                dto.CustomerEmail = customer.Email;
                dto.CustomerPhone = customer.PhoneNumber;
            }
            if (item.SelectedDistributorApplication != null)
            {
                var selected = item.SelectedDistributorApplication;
                var distributor = await _userManager.FindByIdAsync(
                    selected.DistributorID.ToString()
                );
                var payment = await _unitOfWork.PaymentTransactionsRepository.GetAsync(p =>
                    p.MaterialRequestID == selected.MaterialRequestID
                );
                dto.SelectedDistributorApplication = new DistributorApplicationDto
                {
                    DistributorID = distributor?.Id ?? string.Empty,
                    DistributorApplicationID = selected.DistributorApplicationID,
                    MaterialRequestID = selected.MaterialRequestID,
                    DistributorName = distributor?.FullName ?? string.Empty,
                    DistributorEmail = distributor?.Email ?? string.Empty,
                    DistributorPhone = distributor?.PhoneNumber ?? string.Empty,
                    TotalEstimatePrice = selected.TotalEstimatePrice,
                    Status = selected.Status.ToString(),
                    Message = selected.Message,
                    CreatedAt = selected.CreatedAt,
                    Items = _mapper.Map<List<DistributorApplicationItemDto>>(selected.Items),
                    CompletedProjectCount = distributor?.ProjectCount ?? 0,
                    DueCommisionTime = selected.DueCommisionTime,
                    AverageRating = distributor?.AverageRating ?? 0,
                    RatingCount = distributor?.RatingCount ?? 0,
                    SmallScaleProjectCount = distributor?.SmallScaleProjectCount ?? 0,
                    MediumScaleProjectCount = distributor?.MediumScaleProjectCount ?? 0,
                    LargeScaleProjectCount = distributor?.LargeScaleProjectCount ?? 0,
                    ReputationPoints = distributor?.ReputationPoints ?? 0,
                    Payment = _mapper.Map<PaymentTransactionDto>(payment),
                };
            }
        }

        // ==================== Customer ====================
        private async Task MapForCustomerAsync(MaterialRequest item, MaterialRequestDto dto)
        {
            if (item.SelectedDistributorApplication != null)
            {
                var selected = item.SelectedDistributorApplication;
                var distributor = await _userManager.FindByIdAsync(
                    selected.DistributorID.ToString()
                );
                dto.SelectedDistributorApplication = new DistributorApplicationDto
                {
                    DistributorID =
                        selected.Status == ApplicationStatus.Approved
                            ? distributor?.Id ?? string.Empty
                            : string.Empty,
                    DistributorApplicationID = selected.DistributorApplicationID,
                    TotalEstimatePrice = selected.TotalEstimatePrice,
                    Message = selected.Message,
                    Status = selected.Status.ToString(),
                    CreatedAt = selected.CreatedAt,
                    CompletedProjectCount = distributor?.ProjectCount ?? 0,
                    AverageRating = distributor?.AverageRating ?? 0,
                    RatingCount = distributor?.RatingCount ?? 0,
                    DueCommisionTime = selected.DueCommisionTime,
                    SmallScaleProjectCount = distributor?.SmallScaleProjectCount ?? 0,
                    MediumScaleProjectCount = distributor?.MediumScaleProjectCount ?? 0,
                    LargeScaleProjectCount = distributor?.LargeScaleProjectCount ?? 0,
                    ReputationPoints = distributor?.ReputationPoints ?? 0,
                    DistributorName =
                        selected.Status == ApplicationStatus.Approved
                            ? distributor?.FullName ?? string.Empty
                            : string.Empty,
                    DistributorEmail =
                        selected.Status == ApplicationStatus.Approved
                            ? distributor?.Email ?? string.Empty
                            : string.Empty,
                    DistributorPhone =
                        selected.Status == ApplicationStatus.Approved
                            ? distributor?.PhoneNumber ?? string.Empty
                            : string.Empty,
                };
            }
        }

        // ==================== Distributor ====================
        private async Task MapForDistributorAsync(
            MaterialRequest item,
            MaterialRequestDto dto,
            Guid? currentDistributorId
        )
        {
            if (item.SelectedDistributorApplication != null)
            {
                if (item.SelectedDistributorApplication.DistributorID != currentDistributorId)
                {
                    dto.SelectedDistributorApplication = new DistributorApplicationDto
                    {
                        DistributorID = "ANOTHER_CONTRACTOR",
                        DistributorName = "ANOTHER_CONTRACTOR",
                        DistributorEmail = string.Empty,
                        DistributorPhone = string.Empty,
                        Status = item.SelectedDistributorApplication.Status.ToString(),
                    };
                }
                else
                {
                    var selected = item.SelectedDistributorApplication;
                    var contractor = await _userManager.FindByIdAsync(
                        selected.DistributorID.ToString()
                    );
                    dto.SelectedDistributorApplication = new DistributorApplicationDto
                    {
                        DistributorID = contractor?.Id ?? string.Empty,
                        DistributorApplicationID = selected.DistributorApplicationID,
                        DistributorName = contractor?.FullName ?? string.Empty,
                        DistributorEmail = contractor?.Email ?? string.Empty,
                        DistributorPhone = contractor?.PhoneNumber ?? string.Empty,
                        Status = selected.Status.ToString(),
                        DueCommisionTime = selected.DueCommisionTime,
                        Message = selected.Message,
                        CreatedAt = selected.CreatedAt,
                    };
                    if (selected.Status == ApplicationStatus.Approved)
                    {
                        var customer = await _userManager.FindByIdAsync(dto.CustomerID.ToString());
                        if (customer != null)
                        {
                            dto.CustomerName = customer.FullName ?? customer.UserName;
                            dto.CustomerEmail = customer.Email ?? "";
                            dto.CustomerPhone = customer.PhoneNumber ?? "";
                        }
                    }
                }
            }
        }

        public async Task<MaterialRequestDto> CreateNewMaterialRequestAsync(
            MaterialRequestCreateRequestDto materialRequestCreateDto
        )
        {
            var materialRequest = new MaterialRequest();
            materialRequest.MaterialRequestID = Guid.NewGuid();
            materialRequest.CustomerID = materialRequestCreateDto.CustomerID;
            if (materialRequestCreateDto.FirstMaterialID.HasValue)
            {
                var materialRequestItem = new MaterialRequestItem();
                materialRequestItem.MaterialRequestID = materialRequest.MaterialRequestID;
                materialRequestItem.MaterialID = materialRequestCreateDto.FirstMaterialID.Value;
                materialRequestItem.Quantity = 1;
                await _unitOfWork.MaterialRequestItemRepository.AddAsync(materialRequestItem);
            }
            await _unitOfWork.MaterialRequestRepository.AddAsync(materialRequest);
            await _unitOfWork.SaveAsync();
            if (materialRequestCreateDto.FirstMaterialID.HasValue)
            {
                materialRequest = await _unitOfWork.MaterialRequestRepository.GetAsync(
                    m => m.MaterialRequestID == materialRequest.MaterialRequestID,
                    includeProperties: "MaterialRequestItems,MaterialRequestItems.Material"
                );
            }
            var dto = _mapper.Map<MaterialRequestDto>(materialRequest);
            return dto;
        }

        public async Task<MaterialRequestDto> UpdateMaterialRequestAsync(
            MaterialRequestUpdateRequestDto materialRequestUpdateRequestDto
        )
        {
            var materialRequest = await _unitOfWork.MaterialRequestRepository.GetAsync(
                m => m.MaterialRequestID == materialRequestUpdateRequestDto.MaterialRequestID,
                includeProperties: INCLUDE,
                false
            );

            _mapper.Map(materialRequestUpdateRequestDto, materialRequest);
            if (materialRequest == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ERROR_MATERIAL_SERVICE, new[] { ERROR_MATERIAL_SERVICE_NOT_FOUND } },
                    }
                );
            }
            await UpdateMaterialListAsync(materialRequestUpdateRequestDto, materialRequest);
            if (materialRequestUpdateRequestDto.IsSubmit)
            {
                materialRequest.Status = RequestStatus.Opening;
            }
            await _unitOfWork.SaveAsync();
            materialRequest = await _unitOfWork.MaterialRequestRepository.GetAsync(
                m => m.MaterialRequestID == materialRequestUpdateRequestDto.MaterialRequestID,
                includeProperties: INCLUDE
            );
            var dto = _mapper.Map<MaterialRequestDto>(materialRequest);
            var address = await _authorizeDbContext.Addresses.FirstOrDefaultAsync(a =>
                a.AddressID == dto.AddressID
            );

            if (address != null)
            {
                dto.Address = _mapper.Map<AddressDto>(address);
            }

            if (materialRequest?.Status == RequestStatus.Opening)
            {
                var adminDto = _mapper.Map<MaterialRequestDto>(materialRequest);
                var distributorDto = _mapper.Map<MaterialRequestDto>(materialRequest);

                await MapMaterialRequestListAllAsync(
                    new[] { materialRequest },
                    new[] { adminDto },
                    ADMIN
                );
                await MapMaterialRequestListAllAsync(
                    new[] { materialRequest },
                    new[] { distributorDto },
                    DISTRIBUTOR
                );
                await _notificationService.NotifyNewMaterialRequestAsync(materialRequest);
                await _notifier.SendToApplicationGroupAsync(
                    "role_Admin",
                    "MaterialRequest.Created",
                    adminDto
                );
                await _notifier.SendToApplicationGroupAsync(
                    "role_Distributor",
                    "MaterialRequest.Created",
                    distributorDto
                );
            }
            return dto;
        }

        private async Task UpdateMaterialListAsync(
            MaterialRequestUpdateRequestDto dto,
            MaterialRequest materialRequest
        )
        {
            DeleteItemsAsync(dto.DeleteItemIDs, materialRequest);
            UpdateItems(dto.UpdateItems, materialRequest);
            await AddItemsAsync(dto);
        }

        private void DeleteItemsAsync(IEnumerable<Guid>? deleteIds, MaterialRequest materialRequest)
        {
            if (deleteIds == null)
                return;

            foreach (var id in deleteIds)
            {
                var item = materialRequest.MaterialRequestItems?.FirstOrDefault(x =>
                    x.MaterialRequestItemID == id
                );

                if (item != null)
                    _unitOfWork.MaterialRequestItemRepository.Remove(item);
            }
        }

        private static void UpdateItems(
            IEnumerable<MaterialRequestItemUpdateDto>? updates,
            MaterialRequest materialRequest
        )
        {
            if (updates?.Any() != true)
                return;

            var updateDict = updates.ToDictionary(x => x.MaterialRequestItemID);
            var itemsToUpdate = materialRequest
                .MaterialRequestItems?.Where(i => updateDict.ContainsKey(i.MaterialRequestItemID))
                .ToList();

            if (itemsToUpdate == null)
                return;

            foreach (var item in itemsToUpdate)
            {
                var updateDto = updateDict[item.MaterialRequestItemID];
                item.Quantity = updateDto.Quantity;
            }
        }

        private async Task AddItemsAsync(MaterialRequestUpdateRequestDto dto)
        {
            if (dto.AddItems == null)
                return;

            var newItems = dto
                .AddItems.Select(a => new MaterialRequestItem
                {
                    MaterialRequestItemID = Guid.NewGuid(),
                    MaterialRequestID = dto.MaterialRequestID,
                    MaterialID = a.MaterialID,
                    Quantity = a.Quantity,
                })
                .ToList();

            await _unitOfWork.MaterialRequestItemRepository.AddRangeAsync(newItems);
        }

        public async Task DeleteMaterialRequest(Guid materialRequestID)
        {
            var materialRequest = await _unitOfWork.MaterialRequestRepository.GetAsync(
                m => m.MaterialRequestID == materialRequestID,
                includeProperties: INCLUDE_DELETE,
                false
            );
            if (materialRequest == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ERROR_MATERIAL_SERVICE, new[] { ERROR_MATERIAL_SERVICE_NOT_FOUND } },
                    }
                );
            }
            await DeleteRelatedEntity(materialRequest);
            _unitOfWork.MaterialRequestRepository.Remove(materialRequest);

            var noti = await _unitOfWork.NotificationRepository.GetAsync(
                n => n.DataKey == "MaterialRequest" && !n.IsRead,
                asNoTracking: false
            );
            if (noti != null)
            {
                noti.PendingCount -= 1;
                noti.UpdatedAt = DateTime.UtcNow;
                var notiId = noti.NotificationID;
                var newCount = noti.PendingCount;
                if (newCount <= 0)
                {
                    _unitOfWork.NotificationRepository.Remove(noti);
                }
                await _notifier.SendToApplicationGroupAsync(
                    $"role_Distributor",
                    "NotificationMaterialRequest.Delete",
                    new { NotificationID = notiId, PendingCount = newCount }
                );
            }
            await _unitOfWork.SaveAsync();
            await _notifier.SendToApplicationGroupAsync(
                $"role_Distributor",
                "MaterialRequest.Delete",
                new { MaterialRequestID = materialRequestID }
            );
            await _notifier.SendToApplicationGroupAsync(
                $"role_Admin",
                "MaterialRequest.Delete",
                new { MaterialRequestID = materialRequestID }
            );
        }

        private async Task DeleteRelatedEntity(MaterialRequest materialRequest)
        {
            if (materialRequest.MaterialRequestItems != null)
            {
                foreach (var item in materialRequest.MaterialRequestItems)
                {
                    _unitOfWork.MaterialRequestItemRepository.Remove(item);
                }
            }
            if (materialRequest.DistributorApplications != null)
            {
                foreach (var app in materialRequest.DistributorApplications)
                {
                    _unitOfWork.DistributorApplicationRepository.Remove(app);
                }
            }
            await _unitOfWork.SaveAsync();
        }
    }
}
