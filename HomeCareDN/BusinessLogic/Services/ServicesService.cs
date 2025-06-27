using AutoMapper;
using BusinessLogic.DTOs.Application.Service;
using BusinessLogic.DTOs.Application.ServiceRequest;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ultitity.Exceptions;

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


        public async Task<IEnumerable<ServiceDto>> GetAllServiceAsync()
        {
            var service = await _unitOfWork.ServiceRepository
                .GetAllAsync(includeProperties: "Images");
            var serviceMapper = _mapper.Map<IEnumerable<ServiceDto>>(service);
            return serviceMapper;
        }

        public async Task<ServiceDto> CreateServiceAsync(ServiceCreateDto serviceCreateDto)
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
                        if (image.Length > 5 * 1024 * 1024) // 5 MB
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
            var service = await _unitOfWork.ServiceRepository
                .GetAsync(s => s.ServiceID == id, includeProperties: "Images");

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

        public async Task<ServiceDto> UpdateServiceAsync(ServiceUpdateDto serviceUpdateDto)
        {
            var serviceRequest = await _unitOfWork.ServiceRepository
                .GetAsync(s => s.ServiceID == serviceUpdateDto.ServiceID, includeProperties: "Images");
            var errors = new Dictionary<string, string[]>();

            if (serviceRequest == null)
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

            _mapper.Map(serviceUpdateDto, serviceRequest);

            if (serviceRequest.Images != null && serviceRequest.Images.Any())
            {
                foreach (var image in serviceRequest.Images)
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
                        ServiceID = serviceRequest.ServiceID,
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
            var serviceDto = _mapper.Map<ServiceDto>(serviceRequest);
            return serviceDto;
        }

        public async Task DeleteServiceAsync(Guid id)
        {
            var serviceRequest = await _unitOfWork.ServiceRepository
                .GetAsync(s => s.ServiceID == id, includeProperties: "Images");
            if (serviceRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "ServiceRequestID", new[] { $"Service request with ID {id} not found." } },
                };
                throw new CustomValidationException(errors);
            }
            _unitOfWork.ServiceRepository.Remove(serviceRequest);
            if (serviceRequest.Images != null && serviceRequest.Images.Any())
            {
                foreach (var image in serviceRequest.Images)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }
            await _unitOfWork.SaveAsync();
        }
    }
}
