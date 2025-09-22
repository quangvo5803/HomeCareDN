using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.DTOs.Application.ServiceRequest;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace BusinessLogic.Services.Interfaces
{
    public class ServiceRequestService : IServiceRequestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        private const string ERROR_SERVICE_REQUEST = "Service Request";
        private const string ERROR_SERVICE_REQUEST_NOT_FOUND = "SERVICE_REQUEST_NOT_FOUND";
        private const string ERROR_MAXIMUM_IMAGE = "MAXIMUM_IMAGE";
        private const string ERROR_MAXIMUM_IMAGE_SIZE = "MAXIMUM_IMAGE_SIZE";
        private const string INCLUDE = "Images";

        public ServiceRequestService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResultDto<ServiceRequestDto>> GetAllServiceRequestAsync(QueryParameters parameters)
        {
            var query = _unitOfWork.ServiceRequestRepository
                .GetQueryable(includeProperties:INCLUDE);

            var totalCount = await query.CountAsync();

            query = parameters.SortBy?.ToLower() switch
            {
                "createdat" => query.OrderBy(sr => sr.CreatedAt),
                "createdat_desc" => query.OrderByDescending(sr => sr.CreatedAt),
                _ => query.OrderByDescending(sr => sr.CreatedAt),
            };

            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

            var items = await query.ToListAsync();
            return new PagedResultDto<ServiceRequestDto>
            {
                Items = _mapper.Map<IEnumerable<ServiceRequestDto>>(items),
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
            
        }

        public async Task<ServiceRequestDto> GetServiceRequestByIdAsync(Guid id)
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == id,
                includeProperties: INCLUDE
            );
            ValidateServiceRequest(serviceRequest);

            return _mapper.Map<ServiceRequestDto>(serviceRequest);
        }

        public async Task<PagedResultDto<ServiceRequestDto>> GetAllServiceRequestByUserIdAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork.ServiceRequestRepository.GetQueryable(includeProperties: INCLUDE);

            query = query.Where(sr => sr.UserID == parameters.FilterID.ToString());
            var totalCount = await query.CountAsync();

            query = parameters.SortBy?.ToLower() switch
            {
                "createdat" => query.OrderBy(sr => sr.CreatedAt),
                "createdat_desc" => query.OrderByDescending(sr => sr.CreatedAt),
                _ => query.OrderByDescending(sr => sr.CreatedAt),
            };

            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

            var items = await query.ToListAsync();
            return new PagedResultDto<ServiceRequestDto>
            {
                Items = _mapper.Map<IEnumerable<ServiceRequestDto>>(items),
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<ServiceRequestDto> CreateServiceRequestAsync(
            ServiceRequestCreateRequestDto createRequestDto
        )
        {
            ValidateImages(createRequestDto.ImageUrls, 0);

            var serviceRequest = _mapper.Map<ServiceRequest>(createRequestDto);
            await _unitOfWork.ServiceRequestRepository.AddAsync(serviceRequest);
            

            await UploadServiceRequestImagesAsync
            (
                serviceRequest.ServiceRequestID,
                createRequestDto.ImageUrls,
                createRequestDto.ImagePublicIds
            );

            await _unitOfWork.SaveAsync();
            serviceRequest = await _unitOfWork.ServiceRequestRepository
                .GetAsync(
                    sr => sr.ServiceRequestID == serviceRequest.ServiceRequestID,
                    includeProperties: INCLUDE
                );

            return _mapper.Map<ServiceRequestDto>(serviceRequest);
        }

        public async Task<ServiceRequestDto> UpdateServiceRequestAsync(
            ServiceRequestUpdateRequestDto updateRequestDto
        )
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == updateRequestDto.ServiceRequestID,
                includeProperties: INCLUDE
            );

            ValidateServiceRequest(serviceRequest);

            ValidateImages(updateRequestDto.ImageUrls, serviceRequest!.Images?.Count ?? 0);

            _mapper.Map(serviceRequest, updateRequestDto);

           
            // Delete existing images
            //var existingImages = await _unitOfWork.ImageRepository.GetRangeAsync(i =>
            //    i.ServiceRequestID == serviceRequest.ServiceRequestID
            //);

            //if (existingImages != null && existingImages.Any())
            //{
            //    foreach (var image in existingImages)
            //    {
            //        await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
            //    }
            //}
            await UploadServiceRequestImagesAsync
            (
                serviceRequest.ServiceRequestID,
                updateRequestDto.ImageUrls,
                updateRequestDto.ImagePublicIds
            );

            await _unitOfWork.SaveAsync();

            serviceRequest = await _unitOfWork.ServiceRequestRepository
                .GetAsync(
                    sr => sr.ServiceRequestID == serviceRequest.ServiceRequestID,
                    includeProperties: INCLUDE
                );

            return _mapper.Map<ServiceRequestDto>(serviceRequest);
        }

        public async Task DeleteServiceRequestAsync(Guid id)
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(sr =>
                sr.ServiceRequestID == id
            );

            ValidateServiceRequest(serviceRequest);

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
            _unitOfWork.ServiceRequestRepository.Remove(serviceRequest!);
            await _unitOfWork.SaveAsync();
        }

        private async Task UploadServiceRequestImagesAsync(
            Guid? serviceRequestId,
            ICollection<string>? imageUrls,
            ICollection<string>? publicIds
        )
        {
            if (imageUrls == null || !imageUrls.Any()) return;

            var ids = publicIds?.ToList() ?? new List<string>();

            var images = imageUrls.Select((url, i) => new Image
            {
                ImageID = Guid.NewGuid(),
                ServiceRequestID = serviceRequestId,
                ImageUrl = url,
                PublicId = i < ids.Count ? ids[i] : string.Empty
            }).ToList();

            await _unitOfWork.ImageRepository.AddRangeAsync(images);
        }
        private static void ValidateServiceRequest(ServiceRequest? serviceRequest)
        {
            if (serviceRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ERROR_SERVICE_REQUEST, new[] { ERROR_SERVICE_REQUEST_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
        }

        private static void ValidateImages(ICollection<string>? images, int existingCount = 0)
        {
            var errors = new Dictionary<string, string[]>();

            if (images == null)
                return;

            var totalCount = existingCount + images.Count;
            if (totalCount > 5)
            {
                errors.Add(nameof(images), new[] { ERROR_MAXIMUM_IMAGE });
            }

            if (images.Any(i => i.Length > 5 * 1024 * 1024))
            {
                errors.Add(nameof(images), new[] { ERROR_MAXIMUM_IMAGE_SIZE });
            }

            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }
        }
    }
}
