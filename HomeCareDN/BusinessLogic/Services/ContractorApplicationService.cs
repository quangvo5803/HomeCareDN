using AutoMapper;
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ContractorApplicationService : IContractorApplicationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;

        private const string CONTRACTOR_APPLY = "ContractorApply";
        private const string CONTRACTOR = "Contractor";
        private const string APPLICATION = "Application";

        private const string ERROR_SERVICE_REQUEST_NOT_FOUND = "SERVICE_REQUEST_NOT_FOUND";
        private const string ERROR_CONTRACTOR_NOT_FOUND = "CONTRACTOR_NOT_FOUND";
        private const string ERROR_APPLICATION_APPLIED = "APPLYCATION_APPLIED";
        private const string ERROR_APPLICATION_NOT_FOUND = "APPLICATION_NOT_FOUND";
        private const string ERROR_NOT_OWNER = "NOT_OWNER";

        public ContractorApplicationService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            UserManager<ApplicationUser> userManager
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userManager = userManager;
        }

        public async Task<ContractorApplicationFullDto> CreateContractorApplicationAsync(
            ContractorCreateApplicationDto createRequest
        )
        {
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(s =>
                s.ServiceRequestID == createRequest.ServiceRequestID
            );

            if (serviceRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { CONTRACTOR_APPLY, new[] { ERROR_SERVICE_REQUEST_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            var contractor = await _userManager.FindByIdAsync(
                createRequest.ContractorID.ToString()
            );

            if (contractor == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { CONTRACTOR, new[] { ERROR_CONTRACTOR_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            var existingApplication = await _unitOfWork.ContractorApplicationRepository.GetAsync(
                existingApplication =>
                    existingApplication.ServiceRequestID == createRequest.ServiceRequestID
                    && existingApplication.ContractorID == createRequest.ContractorID
            );
            if (existingApplication != null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { APPLICATION, new[] { ERROR_APPLICATION_APPLIED } },
                };
                throw new CustomValidationException(errors);
            }

            var contractorApplication = _mapper.Map<ContractorApplication>(createRequest);
            contractorApplication.ContractorApplicationID = Guid.NewGuid();

            if (createRequest.ImageUrls != null)
            {
                var ids = createRequest.ImagePublicIds?.ToList() ?? new List<string>();
                var images = createRequest
                    .ImageUrls.Select(
                        (url, i) =>
                            new Image
                            {
                                ImageID = Guid.NewGuid(),
                                ImageUrl = url,
                                PublicId = i < ids.Count ? ids[i] : string.Empty,
                                ContractorApplicationID =
                                    contractorApplication.ContractorApplicationID,
                            }
                    )
                    .ToList();

                await _unitOfWork.ImageRepository.AddRangeAsync(images);
            }
            await _unitOfWork.ContractorApplicationRepository.AddAsync(contractorApplication);
            await _unitOfWork.SaveAsync();
            var dto = _mapper.Map<ContractorApplicationFullDto>(contractorApplication);
            dto.ContractorEmail = contractor.Email ?? string.Empty;
            dto.ContractorName = contractor.FullName ?? string.Empty;
            dto.ContractorPhone = contractor.PhoneNumber ?? string.Empty;
            return dto;
        }

        public async Task<ContractorApplicationFullDto?> GetApplicationByRequestAndContractorAsync(
            ContractorGetApplicationDto getRequest
        )
        {
            var result = await _unitOfWork.ContractorApplicationRepository.GetAsync(
                filter: app =>
                    app.ServiceRequestID == getRequest.ServiceRequestID
                    && app.ContractorID == getRequest.ContractorID,
                includeProperties: "Images"
            );

            if (result == null)
            {
                return null;
            }
            var dto = _mapper.Map<ContractorApplicationFullDto>(result);

            var contractor = await _userManager.FindByIdAsync(getRequest.ContractorID.ToString());
            dto.ContractorEmail = contractor?.Email ?? string.Empty;
            dto.ContractorName = contractor?.FullName ?? string.Empty;
            dto.ContractorPhone = contractor?.PhoneNumber ?? string.Empty;

            return dto;
        }

        public async Task DeleteContractorApplicationAsync(Guid id)
        {
            var application = await _unitOfWork.ContractorApplicationRepository.GetAsync(ca =>
                ca.ContractorApplicationID == id
            );

            if (application == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { APPLICATION, new[] { ERROR_APPLICATION_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            var images = await _unitOfWork.ImageRepository.GetRangeAsync(img =>
                img.ContractorApplicationID == id
            );
            if (images != null && images.Any())
            {
                foreach (var image in images)
                {
                    if (!string.IsNullOrEmpty(image.PublicId))
                    {
                        await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                    }
                }
                _unitOfWork.ImageRepository.RemoveRange(images);
            }

            _unitOfWork.ContractorApplicationRepository.Remove(application);

            await _unitOfWork.SaveAsync();
        }
    }
}
