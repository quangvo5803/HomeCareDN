using System.Threading.Tasks;
using AutoMapper;
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Ultitity.Exceptions;
using Ultitity.Extensions;

namespace BusinessLogic.Services
{
    public class ContractorApplicationService : IContractorApplicationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ContractorApplicationService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ContractorApplicationDto> GetContractorApplicationByIdAsync(
            Guid contractorApplicationId
        )
        {
            var application = await _unitOfWork.ContractorApplicationRepository.GetAsync(
                ca => ca.ContractorApplicationID == contractorApplicationId,
                includeProperties: "Images"
            );
            if (application == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    {
                        "ContractorApplicationID",
                        new[]
                        {
                            $"Contractor application with ID {contractorApplicationId} not found.",
                        }
                    },
                };
                throw new CustomValidationException(errors);
            }
            return _mapper.Map<ContractorApplicationDto>(application);
        }

        public async Task<
            List<ContractorApplicationDto>
        > GetContractorApplicationByServiceRequestIDAsync(
            ContractorApplicationGetByServiceRequestDto requestDto
        )
        {
            var applications = await _unitOfWork.ContractorApplicationRepository.GetRangeAsync(
                ca => ca.ServiceRequestID == requestDto.ServiceRequestID,
                includeProperties: "Images"
            );
            if (applications == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    {
                        "ServiceRequestID",
                        new[]
                        {
                            $"No contractor applications found for service request ID {requestDto.ServiceRequestID}.",
                        }
                    },
                };
                throw new CustomValidationException(errors);
            }
            return _mapper.Map<List<ContractorApplicationDto>>(applications);
        }

        public async Task<ContractorApplicationDto> CreateContractorApplicationAsync(
            ContractorApplicationCreateRequestDto createRequestDto
        )
        {
            var errors = new Dictionary<string, string[]>();

            if (createRequestDto.Images != null)
            {
                if (createRequestDto.Images.Count > 5)
                {
                    errors.Add(
                        nameof(createRequestDto.Images),
                        new[] { "You can only upload a maximum of 5 images." }
                    );
                }

                if (createRequestDto.Images.Any(image => image.Length > 5 * 1024 * 1024)) // 5 MB
                {
                    errors.Add(
                        nameof(createRequestDto.Images),
                        new[] { "Each image must be less than 5 MB." }
                    );
                }
            }
            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }
            var contractorApplication = _mapper.Map<ContractorApplication>(createRequestDto);
            await _unitOfWork.ContractorApplicationRepository.AddAsync(contractorApplication);
            await _unitOfWork.SaveAsync();
            if (createRequestDto.Images != null)
            {
                foreach (var image in createRequestDto.Images)
                {
                    Image imageUpload = new Image
                    {
                        ImageID = Guid.NewGuid(),
                        ContractorApplicationID = contractorApplication.ContractorApplicationID,
                        ImageUrl = "",
                    };
                    await _unitOfWork.ImageRepository.UploadImageAsync(
                        image,
                        "HomeCareDN/ContractorApplication",
                        imageUpload
                    );
                }
            }
            return _mapper.Map<ContractorApplicationDto>(contractorApplication);
        }

        public async Task<ContractorApplicationDto> UpdateContractorApplicationAsync(
            ContractorApplicationUpdateRequestDto updateRequestDto
        )
        {
            var errors = new Dictionary<string, string[]>();

            var application = await _unitOfWork.ContractorApplicationRepository.GetAsync(
                ca => ca.ContractorApplicationID == updateRequestDto.ContractorApplicationID,
                includeProperties: "Images"
            );
            if (application == null)
            {
                errors.Add(
                    "ContractorApplication",
                    new[] { "Contractor application update request cannot be null." }
                );
                throw new CustomValidationException(errors);
            }
            if (updateRequestDto.Images != null)
            {
                if (updateRequestDto.Images.Count > 5)
                {
                    errors.Add(
                        nameof(updateRequestDto.Images),
                        new[] { "You can only upload a maximum of 5 images." }
                    );
                }

                if (updateRequestDto.Images.Any(image => image.Length > 5 * 1024 * 1024)) // 5 MB
                {
                    errors.Add(
                        nameof(updateRequestDto.Images),
                        new[] { "Each image must be less than 5 MB." }
                    );
                }
            }
            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }

            _mapper.Map(application, updateRequestDto);
            await _unitOfWork.SaveAsync();
            // Delete existing images
            var existingImages = await _unitOfWork.ImageRepository.GetRangeAsync(i =>
                i.ContractorApplicationID == updateRequestDto.ContractorApplicationID
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
                        ContractorApplicationID = updateRequestDto.ContractorApplicationID,
                        ImageUrl = "",
                    };
                    await _unitOfWork.ImageRepository.UploadImageAsync(
                        image,
                        "HomeCareDN/ContractorApplication",
                        imageUpload
                    );
                }
            }
            return _mapper.Map<ContractorApplicationDto>(application);
        }

        public async Task DeleteContractorApplicationAsync(Guid contractorApplicationId)
        {
            var application = await _unitOfWork.ContractorApplicationRepository.GetAsync(ca =>
                ca.ContractorApplicationID == contractorApplicationId
            );
            if (application == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    {
                        "ContractorApplicationID",
                        new[]
                        {
                            $"Contractor application with ID {contractorApplicationId} not found.",
                        }
                    },
                };
                throw new CustomValidationException(errors);
            }
            var images = await _unitOfWork.ImageRepository.GetRangeAsync(i =>
                i.ContractorApplicationID == contractorApplicationId
            );
            if (images != null && images.Any())
            {
                foreach (var image in images)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }
            _unitOfWork.ContractorApplicationRepository.Remove(application);
            await _unitOfWork.SaveAsync();
        }
    }
}
