using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.DTOs.Application.ServiceRequest;
using BusinessLogic.DTOs.Authorize.AddressDtos;
using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services.Interfaces
{
    public class ServiceRequestService : IServiceRequestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly AuthorizeDbContext _authorizeDbContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ISignalRNotifier _notifier;

        private const string ADMIN = "Admin";
        private const string CONTRACTOR = "Contractor";

        private const string ERROR_SERVICE_REQUEST = "Service Request";
        private const string ERROR_SERVICE_REQUEST_NOT_FOUND = "SERVICE_REQUEST_NOT_FOUND";
        private const string ERROR_MAXIMUM_IMAGE = "MAXIMUM_IMAGE";
        private const string ERROR_MAXIMUM_IMAGE_SIZE = "MAXIMUM_IMAGE_SIZE";
        private const string INCLUDE_LISTALL = "ContractorApplications";
        private const string INCLUDE_DETAIL =
            "Images,ContractorApplications,ContractorApplications.Images,SelectedContractorApplication,SelectedContractorApplication.Images,Conversation";

        public ServiceRequestService(
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

        public async Task<PagedResultDto<ServiceRequestDto>> GetAllServiceRequestAsync(
            QueryParameters parameters,
            string role = ADMIN
        )
        {
            var query = _unitOfWork.ServiceRequestRepository.GetQueryable(
                includeProperties: INCLUDE_LISTALL
            );

            var totalCount = await query.CountAsync();
            if (role == CONTRACTOR && parameters.FilterID != null)
            {
                query = query.Where(s =>
                    s.ContractorApplications != null
                    && s.ContractorApplications.Any(ca => ca.ContractorID == parameters.FilterID)
                );
            }
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
            var dtos = _mapper.Map<IEnumerable<ServiceRequestDto>>(items);

            await MapServiceRequestListAllAsync(items, dtos, role);

            return new PagedResultDto<ServiceRequestDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<ServiceRequestDto> GetServiceRequestByIdAsync(
            ServiceRequestGetByIdDto getByIdDto,
            string role = ADMIN
        )
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == getByIdDto.ServiceRequestID,
                includeProperties: INCLUDE_DETAIL
            );
            ValidateServiceRequest(serviceRequest);

            var dto = _mapper.Map<ServiceRequestDto>(serviceRequest);
            await MapServiceRequestDetailAsync(serviceRequest!, dto, role, getByIdDto.ContractorID);

            return dto;
        }

        public async Task<PagedResultDto<ServiceRequestDto>> GetAllServiceRequestByUserIdAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork
                .ServiceRequestRepository.GetQueryable(includeProperties: INCLUDE_LISTALL)
                .Where(sr => sr.CustomerID == parameters.FilterID);

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
            var dtos = _mapper.Map<IEnumerable<ServiceRequestDto>>(items);

            await MapServiceRequestListAllAsync(items, dtos, "Customer");

            return new PagedResultDto<ServiceRequestDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        private async Task MapServiceRequestListAllAsync(
            IEnumerable<ServiceRequest> items,
            IEnumerable<ServiceRequestDto> dtos,
            string? role = ADMIN
        )
        {
            var itemDict = items.ToDictionary(i => i.ServiceRequestID);

            var addressIds = items.Select(i => i.AddressId).Distinct().ToList();

            var addresses = await _authorizeDbContext
                .Addresses.Where(a => addressIds.Contains(a.AddressID))
                .ToListAsync();

            var addressDict = addresses.ToDictionary(a => a.AddressID);

            foreach (var dto in dtos)
            {
                if (addressDict.TryGetValue(dto.AddressID, out var address))
                {
                    dto.Address = _mapper.Map<AddressDto>(address);
                    if (role == CONTRACTOR)
                    {
                        dto.Address.Detail = string.Empty;
                        dto.Address.Ward = string.Empty;
                    }
                }
            }
        }

        private async Task MapServiceRequestDetailAsync(
            ServiceRequest item,
            ServiceRequestDto dto,
            string role = ADMIN,
            Guid? currentContractorId = null
        )
        {
            // Map address chung
            await MapAddressAsync(item, dto, role, currentContractorId);

            dto.ContractorApplyCount = item.ContractorApplications?.Count ?? 0;

            switch (role)
            {
                case ADMIN:
                    await MapForAdminAsync(item, dto);
                    break;
                case "Customer":
                    await MapForCustomerAsync(item, dto);
                    break;
                case CONTRACTOR:
                    await MapForContractorAsync(item, dto, currentContractorId);
                    break;
            }
        }

        // ==================== Map Address ====================
        private async Task MapAddressAsync(
            ServiceRequest item,
            ServiceRequestDto dto,
            string role,
            Guid? currentContractorId
        )
        {
            if (role == CONTRACTOR)
            {
                var address = await _authorizeDbContext.Addresses.FirstOrDefaultAsync(a =>
                    a.AddressID == item.AddressId
                );
                if (address != null)
                    dto.Address = _mapper.Map<AddressDto>(address);
                bool showAddress =
                    item.Status == RequestStatus.Closed
                    && item.SelectedContractorApplication?.ContractorID == currentContractorId
                    && item.SelectedContractorApplication?.Status == ApplicationStatus.Approved;

                if (!showAddress)
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
        private async Task MapForAdminAsync(ServiceRequest item, ServiceRequestDto dto)
        {
            if (item.SelectedContractorApplication != null)
            {
                var selected = item.SelectedContractorApplication;
                var contractor = await _userManager.FindByIdAsync(selected.ContractorID.ToString());
                dto.SelectedContractorApplication = new ContractorApplicationDto
                {
                    ContractorID = contractor?.Id ?? string.Empty,
                    ContractorApplicationID = selected.ContractorApplicationID,
                    ContractorName = contractor?.FullName ?? string.Empty,
                    ContractorEmail = contractor?.Email ?? string.Empty,
                    ContractorPhone = contractor?.PhoneNumber ?? string.Empty,
                    EstimatePrice = selected.EstimatePrice,
                    Status = selected.Status.ToString(),
                    ImageUrls =
                        selected.Images?.Select(i => i.ImageUrl).ToList() ?? new List<string>(),
                    Description = selected.Description,
                    DueCommisionTime = selected.DueCommisionTime,
                    CreatedAt = selected.CreatedAt,
                    CompletedProjectCount = 0,
                    AverageRating = 0,
                };
            }
        }

        // ==================== Customer ====================
        private async Task MapForCustomerAsync(ServiceRequest item, ServiceRequestDto dto)
        {
            if (item.SelectedContractorApplication != null)
            {
                var selected = item.SelectedContractorApplication;
                var contractor = await _userManager.FindByIdAsync(selected.ContractorID.ToString());
                dto.SelectedContractorApplication = new ContractorApplicationDto
                {
                    ContractorID =
                        selected.Status == ApplicationStatus.Approved
                            ? contractor?.Id ?? string.Empty
                            : string.Empty,
                    ContractorApplicationID = selected.ContractorApplicationID,
                    Description = selected.Description,
                    EstimatePrice = selected.EstimatePrice,
                    ImageUrls =
                        selected.Images?.Select(i => i.ImageUrl).ToList() ?? new List<string>(),
                    Status = selected.Status.ToString(),
                    CreatedAt = selected.CreatedAt,
                    CompletedProjectCount = 0, // hoặc dữ liệu thực tế nếu có
                    AverageRating = 0,
                    DueCommisionTime = selected.DueCommisionTime,
                    ContractorName =
                        selected.Status == ApplicationStatus.Approved
                            ? contractor?.FullName ?? string.Empty
                            : string.Empty,
                    ContractorEmail =
                        selected.Status == ApplicationStatus.Approved
                            ? contractor?.Email ?? string.Empty
                            : string.Empty,
                    ContractorPhone =
                        selected.Status == ApplicationStatus.Approved
                            ? contractor?.PhoneNumber ?? string.Empty
                            : string.Empty,
                };
            }
        }

        // ==================== Contractor ====================
        private async Task MapForContractorAsync(
            ServiceRequest item,
            ServiceRequestDto dto,
            Guid? currentContractorId
        )
        {
            if (item.SelectedContractorApplication != null)
            {
                if (item.SelectedContractorApplication.ContractorID != currentContractorId)
                {
                    dto.SelectedContractorApplication = new ContractorApplicationDto
                    {
                        ContractorID = "ANOTHER_CONTRACTOR",
                        ContractorName = "ANOTHER_CONTRACTOR",
                        ContractorEmail = string.Empty,
                        ContractorPhone = string.Empty,
                        Status = item.SelectedContractorApplication.Status.ToString(),
                        EstimatePrice = 0,
                        ImageUrls = new List<string>(),
                    };
                }
                else
                {
                    var selected = item.SelectedContractorApplication;
                    var contractor = await _userManager.FindByIdAsync(
                        selected.ContractorID.ToString()
                    );
                    dto.SelectedContractorApplication = new ContractorApplicationDto
                    {
                        ContractorID = contractor?.Id ?? string.Empty,
                        ContractorApplicationID = selected.ContractorApplicationID,
                        ContractorName = contractor?.FullName ?? string.Empty,
                        ContractorEmail = contractor?.Email ?? string.Empty,
                        ContractorPhone = contractor?.PhoneNumber ?? string.Empty,
                        EstimatePrice = selected.EstimatePrice,
                        Status = selected.Status.ToString(),
                        DueCommisionTime = selected.DueCommisionTime,
                        ImageUrls =
                            selected.Images?.Select(i => i.ImageUrl).ToList() ?? new List<string>(),
                        Description = selected.Description,
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

        public async Task<ServiceRequestDto> CreateServiceRequestAsync(
            ServiceRequestCreateRequestDto createRequestDto
        )
        {
            ValidateImages(createRequestDto.ImageUrls, 0);

            var serviceRequest = _mapper.Map<ServiceRequest>(createRequestDto);
            if (createRequestDto.Floors == 0)
            {
                serviceRequest.Floors = 1;
            }
            await _unitOfWork.ServiceRequestRepository.AddAsync(serviceRequest);

            await UploadServiceRequestImagesAsync(
                serviceRequest.ServiceRequestID,
                createRequestDto.ImageUrls,
                createRequestDto.ImagePublicIds
            );

            await _unitOfWork.SaveAsync();
            serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == serviceRequest.ServiceRequestID,
                includeProperties: INCLUDE_DETAIL
            );
            if (serviceRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ERROR_SERVICE_REQUEST, new[] { ERROR_SERVICE_REQUEST_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            var dto = _mapper.Map<ServiceRequestDto>(serviceRequest);

            var address = await _authorizeDbContext.Addresses.FirstOrDefaultAsync(a =>
                a.AddressID == dto.AddressID
            );

            if (address != null)
            {
                dto.Address = _mapper.Map<AddressDto>(address);
            }
            var adminDto = _mapper.Map<ServiceRequestDto>(serviceRequest);
            var contractorDto = _mapper.Map<ServiceRequestDto>(serviceRequest);

            await MapServiceRequestListAllAsync(
                new[] { serviceRequest },
                new[] { adminDto },
                ADMIN
            );
            await MapServiceRequestListAllAsync(
                new[] { serviceRequest },
                new[] { contractorDto },
                CONTRACTOR
            );

            await _notifier.SendToApplicationGroupAsync(
                "role_Admin",
                "ServiceRequest.Created",
                adminDto
            );
            await _notifier.SendToApplicationGroupAsync(
                "role_Contractor",
                "ServiceRequest.Created",
                contractorDto
            );

            return dto;
        }

        public async Task<ServiceRequestDto> UpdateServiceRequestAsync(
            ServiceRequestUpdateRequestDto updateRequestDto
        )
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == updateRequestDto.ServiceRequestID,
                includeProperties: INCLUDE_DETAIL,
                false
            );

            ValidateServiceRequest(serviceRequest);

            ValidateImages(updateRequestDto.ImageUrls, serviceRequest!.Images?.Count ?? 0);

            _mapper.Map(updateRequestDto, serviceRequest);
            if (updateRequestDto.Floors == 0)
            {
                serviceRequest.Floors = 1;
            }
            await UploadServiceRequestImagesAsync(
                serviceRequest.ServiceRequestID,
                updateRequestDto.ImageUrls,
                updateRequestDto.ImagePublicIds
            );

            await _unitOfWork.SaveAsync();

            serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == serviceRequest.ServiceRequestID,
                includeProperties: INCLUDE_DETAIL
            );

            var dto = _mapper.Map<ServiceRequestDto>(serviceRequest);

            var address = await _authorizeDbContext.Addresses.FirstOrDefaultAsync(a =>
                a.AddressID == dto.AddressID
            );

            if (address != null)
            {
                dto.Address = _mapper.Map<AddressDto>(address);
            }
            return dto;
        }

        public async Task DeleteServiceRequestAsync(Guid id)
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == id,
                includeProperties: "ContractorApplications.Images",
                false
            );

            ValidateServiceRequest(serviceRequest);

            var images = await _unitOfWork.ImageRepository.GetRangeAsync(i =>
                i.ServiceRequestID == id
            );
            if (images != null && images.Any())
            {
                foreach (var image in images)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }
            await DeleteRelatedEntity(serviceRequest!);
            _unitOfWork.ServiceRequestRepository.Remove(serviceRequest!);
            await _unitOfWork.SaveAsync();
            await _notifier.SendToApplicationGroupAsync(
                $"role_Contractor",
                "ServiceRequest.Delete",
                new { ServiceRequestID = id }
            );
            await _notifier.SendToApplicationGroupAsync(
                $"role_Admin",
                "ServiceRequest.Delete",
                new { ServiceRequestID = id }
            );
        }

        private async Task DeleteRelatedEntity(ServiceRequest serviceRequest)
        {
            if (
                serviceRequest.ContractorApplications != null
                && serviceRequest.ContractorApplications.Any()
            )
            {
                foreach (var contractorApplication in serviceRequest.ContractorApplications)
                {
                    var caImages = await _unitOfWork.ImageRepository.GetRangeAsync(i =>
                        i.ContractorApplicationID == contractorApplication.ContractorApplicationID
                    );
                    if (caImages != null && caImages.Any())
                    {
                        var publicIds = caImages.Select(img => img.PublicId).ToList();

                        await _unitOfWork.ImageRepository.DeleteImagesAsync(publicIds);
                    }
                    _unitOfWork.ContractorApplicationRepository.Remove(contractorApplication);
                }
            }
            await _unitOfWork.SaveAsync();
        }

        private async Task UploadServiceRequestImagesAsync(
            Guid? serviceRequestId,
            ICollection<string>? imageUrls,
            ICollection<string>? publicIds
        )
        {
            if (imageUrls == null || !imageUrls.Any())
                return;

            var ids = publicIds?.ToList() ?? new List<string>();

            var images = imageUrls
                .Select(
                    (url, i) =>
                        new Image
                        {
                            ImageID = Guid.NewGuid(),
                            ServiceRequestID = serviceRequestId,
                            ImageUrl = url,
                            PublicId = i < ids.Count ? ids[i] : string.Empty,
                        }
                )
                .ToList();

            await _unitOfWork.ImageRepository.AddRangeAsync(images);
        }

        private static void ValidateServiceRequest(ServiceRequest? serviceRequest)
        {
            if (serviceRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ERROR_SERVICE_REQUEST, new[] { ERROR_SERVICE_REQUEST_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
        }

        private static void ValidateImages(ICollection<string>? images, int existingCount = 0)
        {
            var errors = new Dictionary<string, string[]>();

            if (images == null)
                return;

            var totalCount = existingCount + images.Count;
            if (totalCount > 5)
            {
                errors.Add(nameof(images), new[] { ERROR_MAXIMUM_IMAGE });
            }

            if (images.Any(i => i.Length > 5 * 1024 * 1024))
            {
                errors.Add(nameof(images), new[] { ERROR_MAXIMUM_IMAGE_SIZE });
            }

            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }
        }
    }
}
