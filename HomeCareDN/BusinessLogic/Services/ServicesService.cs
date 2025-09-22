using System.Security.Cryptography;
using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Brand;
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
        private const string ERROR_URL_MISMATCH = "IMAGE_URLS_PUBLICIDS_MISMATCH";
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
            var totalCount = await query.CountAsync();

            query = parameters.SortBy?.ToLower() switch
            {
                "servicename" => query.OrderBy(s => s.Name),
                "servicename_desc" => query.OrderByDescending(s => s.Name),
                "servicenameen" => query.OrderBy(s => s.NameEN),
                "servicenameen_desc" => query.OrderByDescending(s => s.NameEN),
                "random" => query.OrderBy(s => Guid.NewGuid()),
                _ => query.OrderBy(b => b.ServiceID),
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

        public async Task<ServiceDto> CreateServiceAsync(ServiceCreateRequestDto serviceCreateDto)
        {
            var errors = new Dictionary<string, string[]>();
            ValidateImages(serviceCreateDto.ImageUrls, serviceCreateDto.ImagePublicIds);

            var rsServiceCreate = _mapper.Map<Service>(serviceCreateDto);
            await _unitOfWork.ServiceRepository.AddAsync(rsServiceCreate);

            await UploadServiceImagesAsync(
                rsServiceCreate.ServiceID,
                serviceCreateDto.ImageUrls,
                serviceCreateDto.ImagePublicIds
            );

            await _unitOfWork.SaveAsync();

            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }

            rsServiceCreate = await _unitOfWork.ServiceRepository.GetAsync(
                s => s.ServiceID == rsServiceCreate.ServiceID,
                includeProperties: SERVICE_INCLUDE
            );
            var serviceDto = _mapper.Map<ServiceDto>(rsServiceCreate);
            return serviceDto;
        }

        public async Task<ServiceDto> GetServiceByIdAsync(Guid id)
        {
            var service = await _unitOfWork.ServiceRepository.GetAsync(
                s => s.ServiceID == id,
                includeProperties: "Images"
            );

            if (service == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ERROR_SERVICE, new[] { ERROR_SERVICE_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            return _mapper.Map<ServiceDto>(service);
        }

        public async Task<ServiceDto> UpdateServiceAsync(ServiceUpdateRequestDto serviceUpdateDto)
        {
            //1. Get existing entity to validate and update
            var service = await _unitOfWork.ServiceRepository.GetAsync(
                s => s.ServiceID == serviceUpdateDto.ServiceID,
                includeProperties: SERVICE_INCLUDE
            );
            var errors = new Dictionary<string, string[]>();
            if (service == null)
            {
                errors.Add(ERROR_SERVICE, [ERROR_SERVICE_NOT_FOUND]);
                throw new CustomValidationException(errors);
            }
            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }
            ValidateImages(serviceUpdateDto.ImageUrls, serviceUpdateDto.ImagePublicIds);
            _mapper.Map(serviceUpdateDto, service);

            await UpdateServiceImagesAsync(
                service.ServiceID,
                serviceUpdateDto.ImageUrls,
                serviceUpdateDto.ImagePublicIds,
                service.Images?.ToList() ?? new List<Image>()
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
            var service = await _unitOfWork.ServiceRepository.GetAsync(s => s.ServiceID == id);
            if (service == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ERROR_SERVICE, new[] { ERROR_SERVICE_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
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

        private static void ValidateImages(
            ICollection<string>? imageUrls,
            ICollection<string>? publicIds,
            int existingCount = 0
        )
        {
            var errors = new Dictionary<string, string[]>();
            if (imageUrls == null && publicIds == null)
                return;

            int urlCount = imageUrls?.Count ?? 0;
            int publicIdCount = publicIds?.Count ?? 0;

            if (urlCount != publicIdCount)
                errors.Add(nameof(imageUrls), new[] { ERROR_URL_MISMATCH });

            var totalCount = existingCount + urlCount;
            if (totalCount > 5)
                errors.Add(nameof(imageUrls), new[] { ERROR_MAXIMUM_IMAGE });
            if (errors.Any())
                throw new CustomValidationException(errors);
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

        private async Task UpdateServiceImagesAsync(
            Guid serviceId,
            ICollection<string>? imageUrls,
            ICollection<string>? publicIds,
            List<Image> existingImages
        )
        {
            if (imageUrls == null || publicIds == null)
                return;

            var existingPublicIds = existingImages
                .Select(i => i.PublicId)
                .Where(p => !string.IsNullOrEmpty(p))
                .ToHashSet();

            var incomingPublicIds = publicIds.ToHashSet();

            // Delete images that are no longer in the incoming list
            var imagesToDelete = existingImages
                .Where(i =>
                    !string.IsNullOrEmpty(i.PublicId) && !incomingPublicIds.Contains(i.PublicId)
                )
                .ToList();

            foreach (var image in imagesToDelete)
            {
                if (!string.IsNullOrEmpty(image.PublicId))
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
                _unitOfWork.ImageRepository.Remove(image);
            }

            // Add new images
            var urlList = imageUrls.ToList();
            var publicIdList = publicIds.ToList();

            for (int i = 0; i < urlList.Count; i++)
            {
                if (existingPublicIds.Contains(publicIdList[i]))
                    continue;

                var newImage = new Image
                {
                    ImageID = Guid.NewGuid(),
                    ServiceID = serviceId,
                    ImageUrl = urlList[i],
                    PublicId = publicIdList[i],
                };

                await _unitOfWork.ImageRepository.AddAsync(newImage);
            }
        }
    }
}
