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

        public ServicesService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResultDto<ServiceDto>> GetAllServicesAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork.ServiceRepository.GetQueryable(includeProperties: "Images");
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

            int urlCount = serviceCreateDto.ImageUrls?.Count ?? 0;
            int urlPublicIdCount = serviceCreateDto.ImagePublicIds?.Count ?? 0;

            if (urlCount != urlPublicIdCount)
                errors.Add(ERROR_SERVICE, new[] { ERROR_URL_MISMATCH });

            if (serviceCreateDto.ImageUrls != null)
            {
                if (serviceCreateDto.ImageUrls.Count > 5)
                {
                    errors.Add(ERROR_SERVICE, new[] { ERROR_MAXIMUM_IMAGE });
                }
            }

            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }

            var rsServiceCreate = _mapper.Map<Service>(serviceCreateDto);
            await _unitOfWork.ServiceRepository.AddAsync(rsServiceCreate);

            if (urlCount > 0)
            {
                for (int i = 0; i < urlCount; i++)
                {
                    Image imageUpload = new Image
                    {
                        ImageID = Guid.NewGuid(),
                        ServiceID = rsServiceCreate.ServiceID,
                        ImageUrl = serviceCreateDto.ImageUrls![i],
                        PublicId = serviceCreateDto.ImagePublicIds![i],
                    };
                    await _unitOfWork.ImageRepository.AddAsync(imageUpload);
                }
            }
            await _unitOfWork.SaveAsync();
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
            var service = await _unitOfWork.ServiceRepository.GetAsync(
                s => s.ServiceID == serviceUpdateDto.ServiceID,
                includeProperties: "Images"
            );
            var errors = new Dictionary<string, string[]>();

            int newUrlCount = serviceUpdateDto.ImageUrls?.Count ?? 0;
            int newUrlPublicIdCount = serviceUpdateDto.ImagePublicIds?.Count ?? 0;

            if (service == null)
            {
                errors.Add(ERROR_SERVICE, new[] { ERROR_SERVICE_NOT_FOUND });
                throw new CustomValidationException(errors);
            }
            if (newUrlCount != newUrlPublicIdCount)
            {
                errors.Add(ERROR_SERVICE, new[] { ERROR_URL_MISMATCH });
            }
            if (newUrlCount > 5)
            {
                errors.Add(ERROR_SERVICE, new[] { ERROR_MAXIMUM_IMAGE });
            }
            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }

            _mapper.Map(serviceUpdateDto, service);

            //Vars Handle delete images
            var existingImages = service.Images?.ToList() ?? new List<Image>();
            var existingPublicImageIds = existingImages
                .Select(i => i.PublicId)
                .Where(p => p != null)
                .ToHashSet();

            var incomingPublicIds = (
                serviceUpdateDto.ImagePublicIds ?? new List<string>()
            ).ToHashSet();

            var incomingDelete = existingImages
                .Where(i => i.PublicId != null && !incomingPublicIds.Contains(i.PublicId))
                .ToList();

            // Delete old images
            foreach (var image in incomingDelete)
            {
                if (image.PublicId != null)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
                _unitOfWork.ImageRepository.Remove(image);
            }
            //Add new images
            if (newUrlCount > 0)
            {
                for (int i = 0; i < newUrlPublicIdCount; i++)
                {
                    if (existingPublicImageIds.Contains(serviceUpdateDto.ImagePublicIds![i]))
                        continue;

                    Image imageUpload = new Image
                    {
                        ImageID = Guid.NewGuid(),
                        ServiceID = service.ServiceID,
                        ImageUrl = serviceUpdateDto.ImageUrls![i],
                        PublicId = serviceUpdateDto.ImagePublicIds![i],
                    };
                    await _unitOfWork.ImageRepository.AddAsync(imageUpload);
                }
            }
            await _unitOfWork.SaveAsync();
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
    }
}
