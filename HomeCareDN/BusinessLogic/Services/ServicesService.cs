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
        private const string ERROR_MAXIMUM_IMAGE_SIZE = "MAXIMUM_IMAGE_SIZE";

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

            if (parameters.SortBy?.ToLower() == "random")
            {
                var random = new Random();
                var skipIndex = random.Next(0, Math.Max(0, totalCount - parameters.PageSize + 1));

                query = query.OrderBy(b => b.ServiceID).Skip(skipIndex).Take(parameters.PageSize);
            }
            else
            {
                query = parameters.SortBy?.ToLower() switch
                {
                    "servicename" => query.OrderBy(s => s.Name),
                    "servicename_desc" => query.OrderByDescending(s => s.Name),
                    "servicenameen" => query.OrderBy(s => s.NameEN),
                    "servicenameen_desc" => query.OrderByDescending(s => s.NameEN),
                    _ => query.OrderBy(b => b.ServiceID),
                };
                query = query
                    .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                    .Take(parameters.PageSize);
            }

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

            if (serviceCreateDto.Images != null)
            {
                if (serviceCreateDto.Images.Count > 5)
                {
                    errors.Add(ERROR_SERVICE, new[] { ERROR_MAXIMUM_IMAGE });
                }

                if (serviceCreateDto.Images.Any(i => i.Length > 5 * 1024 * 1024)) // 5 MB
                {
                    errors.Add(ERROR_SERVICE, new[] { ERROR_MAXIMUM_IMAGE_SIZE });
                }
            }

            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }
            var rsServiceCreate = _mapper.Map<Service>(serviceCreateDto);
            await _unitOfWork.ServiceRepository.AddAsync(rsServiceCreate);

            if (serviceCreateDto.Images != null)
            {
                foreach (var image in serviceCreateDto.Images)
                {
                    Image imageUpload = new Image
                    {
                        ImageID = Guid.NewGuid(),
                        ServiceID = rsServiceCreate.ServiceID,
                        ImageUrl = "",
                    };
                    await _unitOfWork.ImageRepository.UploadImageAsync(
                        image,
                        "HomeCareDN/Service",
                        imageUpload
                    );
                }
            }
            await _unitOfWork.SaveAsync();

            return _mapper.Map<ServiceDto>(rsServiceCreate);
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

            if (service == null)
            {
                errors.Add(ERROR_SERVICE, new[] { ERROR_SERVICE_NOT_FOUND });
                throw new CustomValidationException(errors);
            }

            if (serviceUpdateDto.Images != null)
            {
                if (serviceUpdateDto.Images.Count > 5 - service.Images?.Count)
                {
                    errors.Add(ERROR_SERVICE, new[] { ERROR_MAXIMUM_IMAGE });
                }
                if (serviceUpdateDto.Images.Any(i => i.Length > 5 * 1024 * 1024))
                {
                    errors.Add(ERROR_SERVICE, new[] { ERROR_MAXIMUM_IMAGE_SIZE });
                }
            }

            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }

            _mapper.Map(serviceUpdateDto, service);
            // Delete old images
            if (serviceUpdateDto.Images != null)
            {
                foreach (var image in serviceUpdateDto.Images)
                {
                    Image imageUpload = new Image
                    {
                        ImageID = Guid.NewGuid(),
                        ServiceID = service.ServiceID,
                        ImageUrl = "",
                    };
                    await _unitOfWork.ImageRepository.UploadImageAsync(
                        image,
                        "HomeCareDN/Service",
                        imageUpload
                    );
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
