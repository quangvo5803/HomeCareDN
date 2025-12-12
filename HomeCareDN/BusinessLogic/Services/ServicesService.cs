using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Service;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ServicesService : IServicesService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        private const string ERROR_SERVICE = "Service";
        private const string ERROR_SERVICE_NOT_FOUND = "SERVICE_NOT_FOUND";
        private const string ERROR_MAXIMUM_IMAGE = "MAXIMUM_IMAGE";
        private const string ERROR_MAXIMUM_IMAGE_SIZE = "MAXIMUM_IMAGE_SIZE";
        private const string SERVICE_INCLUDE = "Images";

        public ServicesService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResultDto<ServiceDto>> GetAllServicesAsync(
            QueryParameters parameters
        )
        {
            var baseQuery = _unitOfWork.ServiceRepository.GetQueryable();

            if (parameters.ExcludedID != null)
                baseQuery = baseQuery.Where(s => s.ServiceID != parameters.ExcludedID);

            if (!string.IsNullOrEmpty(parameters.SearchType) &&
                Enum.TryParse<ServiceType>(parameters.SearchType, true, out var serviceType)
            )
            {
                baseQuery = baseQuery.Where(s => s.ServiceType == serviceType);
            }


            if (!string.IsNullOrEmpty(parameters.Search))
            {
                var searchUpper = parameters.Search.ToUpper();
                
                baseQuery = baseQuery.Where(s =>
                    (!string.IsNullOrEmpty(s.Name) && s.Name.ToUpper().Contains(searchUpper))
                    || (!string.IsNullOrEmpty(s.NameEN) && s.NameEN.ToUpper().Contains(searchUpper))
                    || (
                        !string.IsNullOrEmpty(s.Description)
                        && s.Description.ToUpper().Contains(searchUpper)
                    )
                    || (
                        !string.IsNullOrEmpty(s.DescriptionEN)
                        && s.DescriptionEN.ToUpper().Contains(searchUpper)
                    )
                );
            }

            if (parameters.FilterServiceType.HasValue)
                baseQuery = baseQuery.Where(s =>
                    s.ServiceType == parameters.FilterServiceType.Value
                );

            if (parameters.FilterPackageOption.HasValue)
                baseQuery = baseQuery.Where(s =>
                    s.PackageOption == parameters.FilterPackageOption.Value
                );

            if (parameters.FilterBuildingType.HasValue)
                baseQuery = baseQuery.Where(s =>
                    s.BuildingType == parameters.FilterBuildingType.Value
                );

            if (parameters.FilterMainStructureType.HasValue)
                baseQuery = baseQuery.Where(s =>
                    s.MainStructureType == parameters.FilterMainStructureType.Value
                );

            if (parameters.FilterDesignStyle.HasValue)
                baseQuery = baseQuery.Where(s =>
                    s.DesignStyle == parameters.FilterDesignStyle.Value
                );

            var totalCount = await baseQuery.CountAsync();

            if (parameters.SortBy == "random")
            {
                var skip = (parameters.PageNumber - 1) * parameters.PageSize;

                var randomIds = await baseQuery
                    .Select(s => s.ServiceID)
                    .OrderBy(x => Guid.NewGuid())
                    .Skip(skip)
                    .Take(parameters.PageSize)
                    .ToListAsync();

                var randomItems = await _unitOfWork
                    .ServiceRepository.GetQueryable(SERVICE_INCLUDE)
                    .Where(s => randomIds.Contains(s.ServiceID))
                    .ToListAsync();

                randomItems = randomItems.OrderBy(x => randomIds.IndexOf(x.ServiceID)).ToList();

                var randomDtos = _mapper.Map<IEnumerable<ServiceDto>>(randomItems);

                return new PagedResultDto<ServiceDto>
                {
                    Items = randomDtos,
                    TotalCount = totalCount,
                    PageNumber = parameters.PageNumber,
                    PageSize = parameters.PageSize,
                };
            }

            var sortedQuery = parameters.SortBy switch
            {
                "servicename" => baseQuery.OrderBy(s =>
                    EF.Functions.Collate(s.Name, "Vietnamese_CI_AS")
                ),
                "servicename_desc" => baseQuery.OrderByDescending(s =>
                    EF.Functions.Collate(s.Name, "Vietnamese_CI_AS")
                ),
                "servicenameen" => baseQuery.OrderBy(s =>
                    EF.Functions.Collate(s.NameEN ?? s.Name, "Latin1_General_CI_AS")
                ),
                "servicenameen_desc" => baseQuery.OrderByDescending(s =>
                    EF.Functions.Collate(s.NameEN ?? s.Name, "Latin1_General_CI_AS")
                ),
                _ => baseQuery.OrderBy(s => s.CreatedAt),
            };

            var pagedIds = await sortedQuery
                .Select(s => s.ServiceID)
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync();

            var items = await _unitOfWork
                .ServiceRepository.GetQueryable(SERVICE_INCLUDE)
                .Where(s => pagedIds.Contains(s.ServiceID))
                .ToListAsync();

            items = items.OrderBy(x => pagedIds.IndexOf(x.ServiceID)).ToList();

            var dtos = _mapper.Map<IEnumerable<ServiceDto>>(items);

            return new PagedResultDto<ServiceDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
                Search = parameters.Search,
            };
        }

        public async Task<ServiceDetailDto> GetServiceByIdAsync(Guid id)
        {
            var service = await _unitOfWork.ServiceRepository.GetAsync(
                s => s.ServiceID == id,
                includeProperties: SERVICE_INCLUDE
            );

            if (service == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ERROR_SERVICE, new[] { ERROR_SERVICE_NOT_FOUND } },
                    }
                );
            }
            return _mapper.Map<ServiceDetailDto>(service);
        }

        public async Task<ServiceDto> CreateServiceAsync(ServiceCreateRequestDto serviceCreateDto)
        {
            ValidateImages(serviceCreateDto.ImageUrls);

            var rsServiceCreate = _mapper.Map<Service>(serviceCreateDto);
            await _unitOfWork.ServiceRepository.AddAsync(rsServiceCreate);

            await UploadServiceImagesAsync(
                rsServiceCreate.ServiceID,
                serviceCreateDto.ImageUrls,
                serviceCreateDto.ImagePublicIds
            );

            await _unitOfWork.SaveAsync();

            rsServiceCreate = await _unitOfWork.ServiceRepository.GetAsync(
                s => s.ServiceID == rsServiceCreate.ServiceID,
                includeProperties: SERVICE_INCLUDE
            );
            var serviceDto = _mapper.Map<ServiceDto>(rsServiceCreate);
            return serviceDto;
        }

        public async Task<ServiceDto> UpdateServiceAsync(ServiceUpdateRequestDto serviceUpdateDto)
        {
            var service = await _unitOfWork.ServiceRepository.GetAsync(
                s => s.ServiceID == serviceUpdateDto.ServiceID,
                includeProperties: SERVICE_INCLUDE,
                false
            );
            if (service == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ERROR_SERVICE, new[] { ERROR_SERVICE_NOT_FOUND } },
                    }
                );
            }
            ValidateImages(serviceUpdateDto.ImageUrls);
            _mapper.Map(serviceUpdateDto, service);

            await UploadServiceImagesAsync(
                service.ServiceID,
                serviceUpdateDto.ImageUrls,
                serviceUpdateDto.ImagePublicIds
            );
            await _unitOfWork.SaveAsync();

            //2. Retrieve the updated entity
            service = await _unitOfWork.ServiceRepository.GetAsync(
                s => s.ServiceID == serviceUpdateDto.ServiceID,
                includeProperties: SERVICE_INCLUDE
            );
            var serviceDto = _mapper.Map<ServiceDto>(service);
            return serviceDto;
        }

        public async Task DeleteServiceAsync(Guid id)
        {
            var service = await _unitOfWork.ServiceRepository.GetAsync(
                s => s.ServiceID == id,
                asNoTracking: false
            );
            if (service == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ERROR_SERVICE, new[] { ERROR_SERVICE_NOT_FOUND } },
                    }
                );
            }
            var images = await _unitOfWork.ImageRepository.GetRangeAsync(i => i.ServiceID == id);
            if (images != null && images.Any())
            {
                foreach (var image in images)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }
            _unitOfWork.ServiceRepository.Remove(service);
            await _unitOfWork.SaveAsync();
        }

        private static void ValidateImages(ICollection<string>? images, int existingCount = 0)
        {
            if (images == null)
                return;

            if (existingCount + images.Count > 5)
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { nameof(images), new[] { ERROR_MAXIMUM_IMAGE } },
                    }
                );

            if (images.Any(i => i.Length > 5 * 1024 * 1024))
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { nameof(images), new[] { ERROR_MAXIMUM_IMAGE_SIZE } },
                    }
                );
        }

        private async Task UploadServiceImagesAsync(
            Guid serviceId,
            ICollection<string>? imageUrls,
            ICollection<string>? publicIds
        )
        {
            if (imageUrls == null || imageUrls.Count == 0)
                return;

            var ids = publicIds?.ToList() ?? new List<string>();

            var images = imageUrls
                .Select(
                    (url, i) =>
                        new Image
                        {
                            ImageID = Guid.NewGuid(),
                            ServiceID = serviceId,
                            ImageUrl = url,
                            PublicId = i < ids.Count ? ids[i] : string.Empty,
                        }
                )
                .ToList();

            await _unitOfWork.ImageRepository.AddRangeAsync(images);
        }
    }
}
