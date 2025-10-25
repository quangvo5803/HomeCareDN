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

        private const string ERROR_SERVICE_REQUEST = "Service Request";
        private const string ERROR_SERVICE_REQUEST_NOT_FOUND = "SERVICE_REQUEST_NOT_FOUND";
        private const string ERROR_MAXIMUM_IMAGE = "MAXIMUM_IMAGE";
        private const string ERROR_MAXIMUM_IMAGE_SIZE = "MAXIMUM_IMAGE_SIZE";
        private const string INCLUDE_LISTALL = "ContractorApplications";
        private const string INCLUDE_DETAIL =
            "Images,ContractorApplications,ContractorApplications.Images,SelectedContractorApplication,SelectedContractorApplication.Images";

        public ServiceRequestService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            AuthorizeDbContext authorizeDbContext,
            UserManager<ApplicationUser> userManager
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _authorizeDbContext = authorizeDbContext;
            _userManager = userManager;
        }

        public async Task<PagedResultDto<ServiceRequestDto>> GetAllServiceRequestAsync(
            QueryParameters parameters,
            bool isContractor = false
        )
        {
            var query = _unitOfWork.ServiceRequestRepository.GetQueryable(
                includeProperties: INCLUDE_LISTALL
            );

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

            await MapServiceRequestListAllAsync(items, dtos);

            return new PagedResultDto<ServiceRequestDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<ServiceRequestDto> GetServiceRequestByIdAsync(
            Guid id,
            bool isContractor = false
        )
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == id,
                includeProperties: INCLUDE_DETAIL
            );
            ValidateServiceRequest(serviceRequest);

            var dto = _mapper.Map<ServiceRequestDto>(serviceRequest);
            await MapServiceRequestDetailsAsync(
                new List<ServiceRequest> { serviceRequest! },
                new List<ServiceRequestDto> { dto }
            );

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

            await MapServiceRequestListAllAsync(items, dtos);

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
            IEnumerable<ServiceRequestDto> dtos
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
                if (itemDict.TryGetValue(dto.ServiceRequestID, out var entity))
                {
                    dto.ContractorApplyCount = entity.ContractorApplications?.Count ?? 0;
                }

                if (addressDict.TryGetValue(dto.AddressID, out var address))
                {
                    dto.Address = _mapper.Map<AddressDto>(address);
                }
            }
        }

        private async Task MapServiceRequestDetailsAsync(
            IEnumerable<ServiceRequest> items,
            IEnumerable<ServiceRequestDto> dtos
        )
        {
            var itemDict = items.ToDictionary(i => i.ServiceRequestID);

            var addressIds = items.Select(i => i.AddressId).Distinct().ToList();

            var addresses = await _authorizeDbContext
                .Addresses.Where(a => addressIds.Contains(a.AddressID))
                .ToListAsync();

            var addressDict = addresses.ToDictionary(a => a.AddressID);

            var selectedContractorIds = items
                .Where(i => i.SelectedContractorApplication != null)
                .Select(i => i.SelectedContractorApplication!.ContractorID.ToString())
                .Distinct()
                .ToList();

            var contractors = await _userManager
                .Users.Where(u => selectedContractorIds.Contains(u.Id))
                .ToListAsync();

            var contractorDict = contractors.ToDictionary(c => c.Id);

            foreach (var dto in dtos)
            {
                if (!itemDict.TryGetValue(dto.ServiceRequestID, out var entity))
                    continue;

                // Map Address
                if (addressDict.TryGetValue(dto.AddressID, out var address))
                {
                    dto.Address = _mapper.Map<AddressDto>(address);
                }

                // Số lượng đã ứng tuyển
                dto.ContractorApplyCount = entity.ContractorApplications?.Count ?? 0;

                // Nếu đã chọn thầu
                if (entity.SelectedContractorApplication != null)
                {
                    var selected = entity.SelectedContractorApplication;
                    contractorDict.TryGetValue(
                        selected.ContractorID.ToString(),
                        out var contractor
                    );

                    dto.SelectedContractorApplication = new ContractorApplicationFullDto
                    {
                        ContractorApplicationID = selected.ContractorApplicationID,
                        Description = selected.Description,
                        EstimatePrice = selected.EstimatePrice,
                        ImageUrls =
                            selected.Images?.Select(i => i.ImageUrl).ToList() ?? new List<string>(),
                        CompletedProjectCount = 0,
                        AverageRating = 4.4,
                        Status = selected.Status.ToString(),
                        ContractorEmail = contractor?.Email ?? string.Empty,
                        ContractorName = contractor?.FullName ?? string.Empty,
                        ContractorPhone = contractor?.PhoneNumber ?? string.Empty,
                        CreatedAt = selected.CreatedAt,
                    };

                    dto.ContractorApplications = null;
                }
                else
                {
                    dto.ContractorApplications =
                        entity
                            .ContractorApplications?.Select(
                                ca => new ContractorApplicationPendingDto
                                {
                                    ContractorApplicationID = ca.ContractorApplicationID,
                                    Description = ca.Description,
                                    EstimatePrice = ca.EstimatePrice,
                                    ImageUrls =
                                        ca.Images?.Select(i => i.ImageUrl).ToList()
                                        ?? new List<string>(),
                                    CompletedProjectCount = 0,
                                    AverageRating = 0,
                                    Status = ca.Status.ToString(),
                                    CreatedAt = ca.CreatedAt,
                                }
                            )
                            .ToList() ?? new List<ContractorApplicationPendingDto>();
                }
            }
        }

        public async Task<ServiceRequestDto> CreateServiceRequestAsync(
            ServiceRequestCreateRequestDto createRequestDto
        )
        {
            ValidateImages(createRequestDto.ImageUrls, 0);

            var serviceRequest = _mapper.Map<ServiceRequest>(createRequestDto);
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

        public async Task<ServiceRequestDto> UpdateServiceRequestAsync(
            ServiceRequestUpdateRequestDto updateRequestDto
        )
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == updateRequestDto.ServiceRequestID,
                includeProperties: INCLUDE_DETAIL
            );

            ValidateServiceRequest(serviceRequest);

            ValidateImages(updateRequestDto.ImageUrls, serviceRequest!.Images?.Count ?? 0);

            _mapper.Map(updateRequestDto, serviceRequest);

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
                includeProperties: INCLUDE_DETAIL
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
                        foreach (var image in caImages)
                        {
                            await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                        }
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
