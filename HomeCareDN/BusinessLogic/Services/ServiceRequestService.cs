using AutoMapper;
using BusinessLogic.DTOs.Application.ServiceRequest;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Http;

namespace BusinessLogic.Services.Interfaces
{
    public class ServiceRequestService : IServiceRequestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ServiceRequestService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ServiceRequestDto> CreateServiceRequestAsync(
            ServiceRequestCreateRequestDto requestDto
        )
        {
            if (requestDto.Images != null)
            {
                if (requestDto.Images.Count > 5)
                {
                    throw new ArgumentException("You can only upload a maximum of 5 images.");
                }

                foreach (var image in requestDto.Images)
                {
                    if (image.Length > 5 * 1024 * 1024) // 5 MB
                    {
                        throw new ArgumentException("Each image must be less than 5 MB.");
                    }
                }
            }
            var serviceRequest = _mapper.Map<ServiceRequest>(requestDto);
            await _unitOfWork.ServiceRequestRepository.AddAsync(serviceRequest);
            await _unitOfWork.SaveAsync();
            if (requestDto.Images != null)
            {
                foreach (var image in requestDto.Images)
                {
                    if (image.Length > 5 * 1024 * 1024) // 5 MB
                    {
                        throw new ArgumentException("Each image must be less than 5 MB.");
                    }
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

        public async Task DeleteServiceRequestAsync(Guid id)
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == id,
                includeProperties: "Images"
            );
            if (serviceRequest == null)
            {
                throw new KeyNotFoundException($"Service request with ID {id} not found.");
            }
            _unitOfWork.ServiceRequestRepository.Remove(serviceRequest);
            if (serviceRequest.Images != null && serviceRequest.Images.Any())
            {
                foreach (var image in serviceRequest.Images)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }
            await _unitOfWork.SaveAsync();
        }

        public async Task<IEnumerable<ServiceRequestDto>> GetAllHardServiceRequestsAsync()
        {
            var serviceRequests = await _unitOfWork.ServiceRequestRepository.GetAllAsync(
                includeProperties: "Images"
            );
            var serviceRequestDtos = _mapper.Map<IEnumerable<ServiceRequestDto>>(serviceRequests);
            return serviceRequestDtos;
        }

        public async Task<ServiceRequestDto> GetServiceRequestByIdAsync(Guid id)
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(sr =>
                sr.ServiceRequestID == id
            );
            if (serviceRequest == null)
            {
                throw new KeyNotFoundException($"Service request with ID {id} not found.");
            }
            var serviceRequestDto = _mapper.Map<ServiceRequestDto>(serviceRequest);
            return serviceRequestDto;
        }

        public async Task<ServiceRequestDto> UpdateServiceRequestAsync(
            ServiceRequestUpdateRequestDto requestDto
        )
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == requestDto.ServiceRequestID,
                includeProperties: "Images"
            );
            if (serviceRequest == null)
            {
                throw new KeyNotFoundException(
                    $"Service request with ID {requestDto.ServiceRequestID} not found."
                );
            }
            if (requestDto.Images != null)
            {
                if (requestDto.Images.Count > 5)
                {
                    throw new ArgumentException("You can only upload a maximum of 5 images.");
                }
                foreach (var image in requestDto.Images)
                {
                    if (image.Length > 5 * 1024 * 1024) // 5 MB
                    {
                        throw new ArgumentException("Each image must be less than 5 MB.");
                    }
                }
            }
            _mapper.Map(requestDto, serviceRequest);
            if (serviceRequest.Images != null && serviceRequest.Images.Any())
            {
                foreach (var image in serviceRequest.Images)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }
            if (requestDto.Images != null)
            {
                foreach (var image in requestDto.Images)
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
            await _unitOfWork.SaveAsync();
            var serviceDto = _mapper.Map<ServiceRequestDto>(serviceRequest);
            return serviceDto;
        }
    }
}
