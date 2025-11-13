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
            var query = _unitOfWork.ServiceRepository.GetQueryable(SERVICE_INCLUDE);
            if (!string.IsNullOrEmpty(parameters.Search))
            {
                var searchUpper = parameters.Search.ToUpper();

                query = query.Where(s =>
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
                query = query.Where(s => s.ServiceType == parameters.FilterServiceType.Value);

            if (parameters.FilterPackageOption.HasValue)
                query = query.Where(s => s.PackageOption == parameters.FilterPackageOption.Value);

            if (parameters.FilterBuildingType.HasValue)
                query = query.Where(s => s.BuildingType == parameters.FilterBuildingType.Value);

            if (parameters.FilterMainStructureType.HasValue)
                query = query.Where(s =>
                    s.MainStructureType == parameters.FilterMainStructureType.Value
                );

            if (parameters.FilterDesignStyle.HasValue)
                query = query.Where(s => s.DesignStyle == parameters.FilterDesignStyle.Value);

            var totalCount = await query.CountAsync();
            query = parameters.SortBy switch
            {
                "servicename" => query.OrderBy(s => s.Name),
                "servicename_desc" => query.OrderByDescending(s => s.Name),
                "servicenameen" => query.OrderBy(s => s.NameEN ?? s.Name),
                "servicenameen_desc" => query.OrderByDescending(s => s.NameEN ?? s.Name),
                "random" => query.OrderBy(s => s.ServiceID),
                _ => query.OrderBy(b => b.CreatedAt),
            };
            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

            var items = await query.ToListAsync();

            var serviceDtos = _mapper.Map<IEnumerable<ServiceDto>>(items);
            return new PagedResultDto<ServiceDto>
            {
                Items = serviceDtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
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
