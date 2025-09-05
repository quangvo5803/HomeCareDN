using AutoMapper;
using BusinessLogic.DTOs.Application.ServiceRequest;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Ultitity.Exceptions;
using Ultitity.Extensions;

namespace BusinessLogic.Services.Interfaces
{
    public class ServiceRequestService : IServiceRequestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        private const string ERROR_SERVICE_REQUEST = "Service Request";
        private const string ERROR_SERVICE_REQUEST_NOT_FOUND = "Service request not found.";
        private const string ERROR_MAXIMUM_IMAGE = "You can only upload a maximum of 5 images.";
        private const string ERROR_MAXIMUM_IMAGE_SIZE = "Each image must be less than 5 MB.";

        public ServiceRequestService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceRequestDto> GetServiceRequestByIdAsync(Guid id)
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == id,
                includeProperties: "Images"
            );
            if (serviceRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ERROR_SERVICE_REQUEST, new[] { ERROR_SERVICE_REQUEST_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            var serviceRequestDto = _mapper.Map<ServiceRequestDto>(serviceRequest);
            return serviceRequestDto;
        }

        public async Task<ServiceRequestDto> CreateServiceRequestAsync(
            ServiceRequestCreateRequestDto createRequestDto
        )
        {
            var errors = new Dictionary<string, string[]>();

            if (createRequestDto.Images != null)
            {
                if (createRequestDto.Images.Count > 5)
                {
                    errors.Add(ERROR_SERVICE_REQUEST, new[] { ERROR_MAXIMUM_IMAGE });
                }

                if (createRequestDto.Images.Any(i => i.Length > 5 * 1024 * 1024))
                {
                    errors.Add(ERROR_SERVICE_REQUEST, new[] { ERROR_MAXIMUM_IMAGE_SIZE });
                }
            }
            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }
            var serviceRequest = _mapper.Map<ServiceRequest>(createRequestDto);
            await _unitOfWork.ServiceRequestRepository.AddAsync(serviceRequest);
            await _unitOfWork.SaveAsync();
            if (createRequestDto.Images != null)
            {
                foreach (var image in createRequestDto.Images)
                {
                    Image imageUpload = new Image
                    {
                        ImageID = Guid.NewGuid(),
                        ServiceRequestID = serviceRequest.ServiceRequestID,
                        ImageUrl = "",
                    };
                    await _unitOfWork.ImageRepository.UploadImageAsync(
                        image,
                        "HomeCareDN/ServiceRequest",
                        imageUpload
                    );
                }
            }
            return _mapper.Map<ServiceRequestDto>(serviceRequest);
        }

        public async Task<ServiceRequestDto> UpdateServiceRequestAsync(
            ServiceRequestUpdateRequestDto updateRequestDto
        )
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == updateRequestDto.ServiceRequestID,
                includeProperties: "Images"
            );
            var errors = new Dictionary<string, string[]>();

            if (serviceRequest == null)
            {
                errors.Add(ERROR_SERVICE_REQUEST, new[] { ERROR_SERVICE_REQUEST_NOT_FOUND });
                throw new CustomValidationException(errors);
            }

            if (updateRequestDto.Images != null)
            {
                if (updateRequestDto.Images.Count > 5)
                {
                    errors.Add(ERROR_SERVICE_REQUEST, new[] { ERROR_MAXIMUM_IMAGE });
                }

                if (updateRequestDto.Images.Any(i => i.Length > 5 * 1024 * 1024))
                {
                    errors.Add(nameof(updateRequestDto.Images), new[] { ERROR_MAXIMUM_IMAGE_SIZE });
                }
            }

            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }

            serviceRequest.PatchFrom(updateRequestDto);

            await _unitOfWork.SaveAsync();
            // Delete existing images
            var existingImages = await _unitOfWork.ImageRepository.GetRangeAsync(i =>
                i.ServiceRequestID == serviceRequest.ServiceRequestID
            );

            if (existingImages != null && existingImages.Any())
            {
                foreach (var image in existingImages)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }
            if (updateRequestDto.Images != null)
            {
                foreach (var image in updateRequestDto.Images)
                {
                    Image imageUpload = new Image
                    {
                        ImageID = Guid.NewGuid(),
                        ServiceRequestID = serviceRequest.ServiceRequestID,
                        ImageUrl = "",
                    };
                    await _unitOfWork.ImageRepository.UploadImageAsync(
                        image,
                        "HomeCareDN/ServiceRequest",
                        imageUpload
                    );
                }
            }
            var serviceDto = _mapper.Map<ServiceRequestDto>(serviceRequest);
            return serviceDto;
        }

        public async Task DeleteServiceRequestAsync(Guid id)
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(sr =>
                sr.ServiceRequestID == id
            );
            if (serviceRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ERROR_SERVICE_REQUEST, new[] { ERROR_SERVICE_REQUEST_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
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
            _unitOfWork.ServiceRequestRepository.Remove(serviceRequest);
            await _unitOfWork.SaveAsync();
        }
    }
}
