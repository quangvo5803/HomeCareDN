using System.Diagnostics.Contracts;
using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.DistributorApplication;
using BusinessLogic.DTOs.Application.MaterialRequest;
using BusinessLogic.DTOs.Application.ServiceRequest;
using BusinessLogic.DTOs.Authorize.User;
using BusinessLogic.Services.Interfaces;
using CloudinaryDotNet.Actions;
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

        private const string ADMIN = "Admin";
        private const string DISTRIBUTOR = "Distributor";
        private const string INCLUDE_DELETE = "MaterialRequestItems,DistributorApplications";
        private const string INCLUDE =
            "MaterialRequestItems,MaterialRequestItems.Material,MaterialRequestItems.Material.Images,DistributorApplications,SelectedDistributorApplication";
        private const string ERROR_MATERIAL_SERVICE = "MATERIAL_SERVICE";
        private const string ERROR_MATERIAL_SERVICE_NOT_FOUND = "MATERIAL_SERVICE_NOT_FOUND";

        public MaterialRequestService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            AuthorizeDbContext authorizeDbContext,
            UserManager<ApplicationUser> userManager,
            ISignalRNotifier notifier
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _authorizeDbContext = authorizeDbContext;
            _userManager = userManager;
            _notifier = notifier;
        }

        public async Task<PagedResultDto<MaterialRequestDto>> GetAllMaterialRequestsAsync(
            QueryParameters parameters,
            string role = "Admin"
        )
        {
            var query = _unitOfWork.MaterialRequestRepository.GetQueryable(
                includeProperties: INCLUDE
            );
            query = query.Where(s => s.Status == RequestStatus.Opening || s.Status == RequestStatus.Closed);

            if( parameters.FilterID != null && role == DISTRIBUTOR)
            {
                query = query.Where(s => s.DistributorApplications != null 
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

            var addressIds = items
                .Where(i => i.AddressId.HasValue)
                .Select(i => i.AddressId!.Value)
                .Distinct()
                .ToList();

            var addresses = await _authorizeDbContext
                .Addresses
                .Where(a => addressIds.Contains(a.AddressID))
                .ToListAsync();

            var addressDict = addresses.ToDictionary(a => a.AddressID);

            foreach (var dto in dtos)
            {
                // --- Address mapping ---
                if (dto.AddressID.HasValue &&
                    addressDict.TryGetValue(dto.AddressID.Value, out var address))
                {
                    dto.Address = _mapper.Map<AddressDto>(address);

                    if (role == DISTRIBUTOR)
                    {
                        dto.Address.Detail = string.Empty;
                        dto.Address.Ward = string.Empty;
                    }
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
            if (item.SelectedDistributorApplication != null)
            {
                var selected = item.SelectedDistributorApplication;
                var distributor = await _userManager.FindByIdAsync(
                    selected.DistributorID.ToString()
                );
                dto.SelectedDistributorApplication = new DistributorApplicationDto
                {
                    DistributorID = distributor?.Id ?? string.Empty,
                    DistributorApplicationID = selected.DistributorApplicationID,
                    DistributorName = distributor?.FullName ?? string.Empty,
                    DistributorEmail = distributor?.Email ?? string.Empty,
                    DistributorPhone = distributor?.PhoneNumber ?? string.Empty,
                    Status = selected.Status.ToString(),
                    Message = selected.Message,
                    CreatedAt = selected.CreatedAt,
                    CompletedProjectCount = 0,
                    AverageRating = 0,
                };
            }
        }

        // ==================== Customer ====================
        private async Task MapForCustomerAsync(MaterialRequest item, MaterialRequestDto dto)
        {
            if (item.SelectedDistributorApplication != null)
            {
                var selected = item.SelectedDistributorApplication;
                var contractor = await _userManager.FindByIdAsync(
                    selected.DistributorID.ToString()
                );
                dto.SelectedDistributorApplication = new DistributorApplicationDto
                {
                    DistributorID =
                        selected.Status == ApplicationStatus.Approved
                            ? contractor?.Id ?? string.Empty
                            : string.Empty,
                    DistributorApplicationID = selected.DistributorApplicationID,
                    Message = selected.Message,
                    Status = selected.Status.ToString(),
                    CreatedAt = selected.CreatedAt,
                    CompletedProjectCount = 0,
                    AverageRating = 0,
                    DistributorName =
                        selected.Status == ApplicationStatus.Approved
                            ? contractor?.FullName ?? string.Empty
                            : string.Empty,
                    DistributorEmail =
                        selected.Status == ApplicationStatus.Approved
                            ? contractor?.Email ?? string.Empty
                            : string.Empty,
                    DistributorPhone =
                        selected.Status == ApplicationStatus.Approved
                            ? contractor?.PhoneNumber ?? string.Empty
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
                await _unitOfWork.MaterialRequestItemRepository.AddAsync(materialRequestItem);
            }
            await _unitOfWork.MaterialRequestRepository.AddAsync(materialRequest);
            await _unitOfWork.SaveAsync();
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
            MaterialRequestUpdateRequestDto materialRequestUpdateRequestDto,
            MaterialRequest materialRequest
        )
        {
            if (materialRequestUpdateRequestDto.DeleteItemIDs != null)
            {
                foreach (var itemId in materialRequestUpdateRequestDto.DeleteItemIDs)
                {
                    var item = materialRequest.MaterialRequestItems?.FirstOrDefault(m =>
                        m.MaterialRequestItemID == itemId
                    );
                    if (item != null)
                    {
                        _unitOfWork.MaterialRequestItemRepository.Remove(item);
                    }
                }
            }

            if (materialRequestUpdateRequestDto.UpdateItems != null)
            {
                foreach (var updateDto in materialRequestUpdateRequestDto.UpdateItems)
                {
                    var updateItem = await _unitOfWork.MaterialRequestItemRepository.GetAsync(
                        i => i.MaterialRequestItemID == updateDto.MaterialRequestItemID,
                        asNoTracking: false
                    );
                    if (updateItem != null)
                    {
                        updateItem.Quantity = updateDto.Quantity;
                    }
                }
            }
            if (materialRequestUpdateRequestDto.AddItems != null)
            {
                foreach (var newItem in materialRequestUpdateRequestDto.AddItems)
                {
                    await _unitOfWork.MaterialRequestItemRepository.AddAsync(
                        new MaterialRequestItem
                        {
                            MaterialRequestID = materialRequestUpdateRequestDto.MaterialRequestID,
                            MaterialID = newItem.MaterialID,
                            Quantity = newItem.Quantity,
                        }
                    );
                }
            }
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
