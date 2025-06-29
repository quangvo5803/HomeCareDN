using AutoMapper;
using BusinessLogic.DTOs.Application.ServiceRequest;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Ultitity.Exceptions;

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

        public async Task<IEnumerable<ServiceRequestDto>> GetAllHardServiceRequestsAsync(
            ServiceRequestGetAllDto request
        )
        {
            var serviceRequests = await _unitOfWork.ServiceRequestRepository.GetAllAsync(
                request.FilterOn,
                request.FilterQuery,
                request.SortBy,
                request.IsAscending,
                request.PageNumber,
                request.PageSize,
                includeProperties: "Images"
            );
            if (serviceRequests == null || !serviceRequests.Any())
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "ServiceRequests", new[] { "No service requests found." } },
                };
                throw new CustomValidationException(errors);
            }
            var serviceRequestDtos = _mapper.Map<IEnumerable<ServiceRequestDto>>(serviceRequests);
            return serviceRequestDtos;
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
                    { "ServiceRequestID", new[] { $"Service request with ID {id} not found." } },
                };
                throw new CustomValidationException(errors);
            }
            var serviceRequestDto = _mapper.Map<ServiceRequestDto>(serviceRequest);
            return serviceRequestDto;
        }

        public async Task<ServiceRequestDto> CreateServiceRequestAsync(
            ServiceRequestCreateRequestDto requestDto
        )
        {
            var errors = new Dictionary<string, string[]>();

            if (requestDto.Images != null)
            {
                if (requestDto.Images.Count > 5)
                {
                    errors.Add(
                        nameof(requestDto.Images),
                        new[] { "You can only upload a maximum of 5 images." }
                    );
                }

                foreach (var image in requestDto.Images)
                {
                    if (image.Length > 5 * 1024 * 1024)
                    {
                        if (!errors.ContainsKey(nameof(requestDto.Images)))
                        {
                            errors[nameof(requestDto.Images)] = new List<string>().ToArray();
                        }

                        var messages = errors[nameof(requestDto.Images)].ToList();
                        messages.Add("Each image must be less than 5 MB.");
                        errors[nameof(requestDto.Images)] = messages.ToArray();
                    }
                }
            }
            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }
            var serviceRequest = _mapper.Map<ServiceRequest>(requestDto);
            await _unitOfWork.ServiceRequestRepository.AddAsync(serviceRequest);
            await _unitOfWork.SaveAsync();
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
            return _mapper.Map<ServiceRequestDto>(serviceRequest);
        }

        public async Task<ServiceRequestDto> UpdateServiceRequestAsync(
            ServiceRequestUpdateRequestDto requestDto
        )
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == requestDto.ServiceRequestID,
                includeProperties: "Images"
            );
            var errors = new Dictionary<string, string[]>();

            if (serviceRequest == null)
            {
                errors.Add(
                    "ServiceRequestID",
                    new[] { $"Service request with ID {requestDto.ServiceRequestID} not found." }
                );
                throw new CustomValidationException(errors);
            }

            if (requestDto.Images != null)
            {
                if (requestDto.Images.Count > 5)
                {
                    errors.Add(
                        nameof(requestDto.Images),
                        new[] { "You can only upload a maximum of 5 images." }
                    );
                }

                foreach (var image in requestDto.Images)
                {
                    if (image.Length > 5 * 1024 * 1024)
                    {
                        if (errors.ContainsKey(nameof(requestDto.Images)))
                        {
                            var messages = errors[nameof(requestDto.Images)].ToList();
                            messages.Add("Each image must be less than 5 MB.");
                            errors[nameof(requestDto.Images)] = messages.ToArray();
                        }
                        else
                        {
                            errors.Add(
                                nameof(requestDto.Images),
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

            _mapper.Map(requestDto, serviceRequest);
            await _unitOfWork.SaveAsync();

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

        public async Task DeleteServiceRequestAsync(Guid id)
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == id,
                includeProperties: "Images"
            );
            if (serviceRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "ServiceRequestID", new[] { $"Service request with ID {id} not found." } },
                };
                throw new CustomValidationException(errors);
            }
            if (serviceRequest.Images != null && serviceRequest.Images.Any())
            {
                foreach (var image in serviceRequest.Images)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }
            _unitOfWork.ServiceRequestRepository.Remove(serviceRequest);
            await _unitOfWork.SaveAsync();
        }
    }
}
