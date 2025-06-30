using AutoMapper;
using BusinessLogic.DTOs.Application.Service;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Ultitity.Exceptions;
using Ultitity.Extensions;

namespace BusinessLogic.Services
{
    public class ServicesService : IServicesService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ServicesService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ServiceDto>> GetAllServiceAsync(ServiceGetAllDto getAllDto)
        {
            var services = await _unitOfWork.ServiceRepository.GetAllAsync(
                getAllDto.FilterOn,
                getAllDto.FilterQuery,
                getAllDto.SortBy,
                getAllDto.IsAscending,
                getAllDto.PageNumber,
                getAllDto.PageSize,
                includeProperties: "Images"
            );
            if (services == null || !services.Any())
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Service", new[] { "No service found." } },
                };
                throw new CustomValidationException(errors);
            }

            var serviceMapper = _mapper.Map<IEnumerable<ServiceDto>>(services);
            return serviceMapper;
        }

        public async Task<ServiceDto> CreateServiceAsync(ServiceCreateRequestDto serviceCreateDto)
        {
            var errors = new Dictionary<string, string[]>();

            if (serviceCreateDto.Images != null)
            {
                if (serviceCreateDto.Images.Count > 5)
                {
                    errors.Add(
                        nameof(serviceCreateDto.Images),
                        new[] { "You can only upload a maximum of 5 images." }
                    );
                }

                foreach (var image in serviceCreateDto.Images)
                {
                    if (image.Length > 5 * 1024 * 1024) // 5 MB
                    {
                        {
                            if (errors.ContainsKey(nameof(serviceCreateDto.Images)))
                            {
                                var messages = errors[nameof(serviceCreateDto.Images)].ToList();
                                messages.Add("Each image must be less than 5 MB.");
                                errors[nameof(serviceCreateDto.Images)] = messages.ToArray();
                            }
                            else
                            {
                                errors.Add(
                                    nameof(serviceCreateDto.Images),
                                    new[] { "Each image must be less than 5 MB." }
                                );
                            }
                        }
                    }
                }
            }

            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }
            var rsServiceCreate = _mapper.Map<Service>(serviceCreateDto);
            await _unitOfWork.ServiceRepository.AddAsync(rsServiceCreate);
            await _unitOfWork.SaveAsync();

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
                    { "ServiceRequestID", new[] { $"Service request with ID {id} not found." } },
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
                errors.Add(
                    "ServiceID",
                    new[] { $"Service request with ID {serviceUpdateDto.ServiceID} not found." }
                );
                throw new CustomValidationException(errors);
            }

            if (serviceUpdateDto.Images != null)
            {
                if (serviceUpdateDto.Images.Count > 5)
                {
                    errors.Add(
                        nameof(serviceUpdateDto.Images),
                        new[] { "You can only upload a maximum of 5 images." }
                    );
                }

                foreach (var image in serviceUpdateDto.Images)
                {
                    if (image.Length > 5 * 1024 * 1024)
                    {
                        if (errors.ContainsKey(nameof(serviceUpdateDto.Images)))
                        {
                            var messages = errors[nameof(serviceUpdateDto.Images)].ToList();
                            messages.Add("Each image must be less than 5 MB.");
                            errors[nameof(serviceUpdateDto.Images)] = messages.ToArray();
                        }
                        else
                        {
                            errors.Add(
                                nameof(serviceUpdateDto.Images),
                                new[] { "Each image must be less than 5 MB." }
                            );
                        }
                    }
                }
            }

            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }

            service.PatchFrom(serviceUpdateDto);
            await _unitOfWork.SaveAsync();
            // Delete old images
            var existingImages = await _unitOfWork.ImageRepository.GetRangeAsync(i =>
                i.ServiceID == service.ServiceID
            );
            if (existingImages != null && existingImages.Any())
            {
                foreach (var image in existingImages)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }
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
                    { "ServiceRequestID", new[] { $"Service request with ID {id} not found." } },
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
