<<<<<<< HEAD
﻿using System.Data;
using AutoMapper;
using BusinessLogic.DTOs.Application;
=======
﻿using AutoMapper;
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.Services.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
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
        private readonly ISignalRNotifier _notifier;

        private const string CONTRACTOR_APPLY = "ContractorApply";
        private const string CONTRACTOR = "Contractor";
        private const string APPLICATION = "Application";

        private const string ERROR_SERVICE_REQUEST_NOT_FOUND = "SERVICE_REQUEST_NOT_FOUND";
        private const string ERROR_CONTRACTOR_NOT_FOUND = "CONTRACTOR_NOT_FOUND";
        private const string ERROR_APPLICATION_APPLIED = "APPLYCATION_APPLIED";
        private const string ERROR_APPLICATION_NOT_FOUND = "APPLICATION_NOT_FOUND";

        public ContractorApplicationService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            UserManager<ApplicationUser> userManager,
            ISignalRNotifier notifier
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userManager = userManager;
            _notifier = notifier;
        }

<<<<<<< HEAD
=======
        public async Task<
            PagedResultDto<ContractorApplicationDto>
        > GetAllContractorApplicationByServiceRequestIdAsync(
            QueryParameters parameters,
            string role = "Customer"
        )
        {
            var query = _unitOfWork
                .ContractorApplicationRepository.GetQueryable(includeProperties: "Images")
                .Where(ca => ca.ServiceRequestID == parameters.FilterID)
                .AsSingleQuery()
                .AsNoTracking();

            var totalCount = await query.CountAsync();
            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

            var items = await query.ToListAsync();
            var dtos = _mapper.Map<IEnumerable<ContractorApplicationDto>>(items);
            foreach (var dto in dtos)
            {
                //Hidden to low loading => show when getById
                dto.Description = string.Empty;
                if (role == "Admin")
                {
                    var contractor = await _userManager.FindByIdAsync(dto.ContractorID.ToString());
                    if (contractor != null)
                    {
                        dto.ContractorEmail = contractor.Email ?? string.Empty;
                        dto.ContractorPhone = contractor.PhoneNumber ?? string.Empty;
                        dto.ContractorName =
                            contractor.FullName ?? contractor.UserName ?? string.Empty;
                    }
                }
            }
            return new PagedResultDto<ContractorApplicationDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

<<<<<<< HEAD
        public async Task<ContractorApplicationDto?> GetContractorApplicationByServiceRequestIDAsync(
            ContractorApplicationGetDto contractorApplicationGetDto
        )
        {
            var contractorApplication = await _unitOfWork.ContractorApplicationRepository.GetAsync(
                ca =>
                    ca.ServiceRequestID == contractorApplicationGetDto.ServiceRequestID
                    && ca.ContractorID == contractorApplicationGetDto.ContractorID,
                includeProperties: "Images"
            );
            if (contractorApplication == null)
            {
                return null;
            }
            var dto = _mapper.Map<ContractorApplicationDto>(contractorApplication);
            var contractor = await _userManager.FindByIdAsync(
                contractorApplication.ContractorID.ToString()
            );

            if (contractor != null)
            {
                dto.ContractorName = contractor.FullName ?? contractor.UserName ?? "";
                dto.ContractorEmail = contractor.Email ?? "";
                dto.ContractorPhone = contractor.PhoneNumber ?? "";
            }
            return dto;
        }

        public async Task<ContractorApplicationDto> GetContractorApplicationByIDAsync(
            Guid id,
            string role = "Customer"
        )
        {
            var contractorApplication = await _unitOfWork.ContractorApplicationRepository.GetAsync(
                ca => ca.ContractorApplicationID == id,
                includeProperties: "Images"
            );
            if (contractorApplication == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { APPLICATION, new[] { ERROR_APPLICATION_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            var dto = _mapper.Map<ContractorApplicationDto>(contractorApplication);
            var contractor = await _userManager.FindByIdAsync(
                contractorApplication.ContractorID.ToString()
            );

            if (contractor != null)
            {
                dto.ContractorName = contractor.FullName ?? contractor.UserName ?? "";
                dto.ContractorEmail = contractor.Email ?? "";
                dto.ContractorPhone = contractor.PhoneNumber ?? "";
                if (role == "Customer" && dto.Status != ApplicationStatus.Approved.ToString())
                {
                    dto.ContractorName = string.Empty;
                    dto.ContractorEmail = string.Empty;
                    dto.ContractorPhone = string.Empty;
                }
            }
            return dto;
        }

        public async Task<ContractorApplicationDto> CreateContractorApplicationAsync(
=======
>>>>>>> develop
        public async Task<ContractorApplicationFullDto> CreateContractorApplicationAsync(
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
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
            if (createRequest.DocumentUrls != null && createRequest.DocumentUrls.Any())
            {
                var docIds = createRequest.DocumentPublicIds?.ToList() ?? new List<string>();
                var documents = createRequest
                    .DocumentUrls.Select(
                        (url, i) =>
                            new Document
                            {
                                DocumentID = Guid.NewGuid(),
                                DocumentUrl = url,
                                PublicId = i < docIds.Count ? docIds[i] : string.Empty,
                                ContractorApplicationID =
                                    contractorApplication.ContractorApplicationID,
                            }
                    )
                    .ToList();

                await _unitOfWork.DocumentRepository.AddRangeAsync(documents);
            }

            await _unitOfWork.ContractorApplicationRepository.AddAsync(contractorApplication);
            await _unitOfWork.SaveAsync();
            var dto = _mapper.Map<ContractorApplicationDto>(contractorApplication);

            dto.ContractorEmail = contractor.Email ?? string.Empty;
            dto.ContractorName = contractor.FullName ?? string.Empty;
            dto.ContractorPhone = contractor.PhoneNumber ?? string.Empty;
            dto.Status = ApplicationStatus.Pending.ToString();
            var customerDto = _mapper.Map<ContractorApplicationDto>(contractorApplication);

<<<<<<< HEAD
            customerDto.ContractorName = string.Empty;
            customerDto.ContractorEmail = string.Empty;
            customerDto.ContractorPhone = string.Empty;
            customerDto.Status = ApplicationStatus.Pending.ToString();

            await _notifier.SendToGroupAsync($"role_Admin", "ContractorApplication.Created", dto);

            await _notifier.SendToGroupAsync(
                $"user_{serviceRequest.CustomerID}",
                "ContractorApplication.Created",
                customerDto
            );
=======
        public async Task<ContractorApplicationFullDto?> GetApplicationByServiceRequestIDAndContractorIDAsync(
            ContractorGetApplicationDto getRequest
        )
        {
            var result = await _unitOfWork.ContractorApplicationRepository.GetAsync(
                filter: app =>
                    app.ServiceRequestID == getRequest.ServiceRequestID
                    && app.ContractorID == getRequest.ContractorID,
                includeProperties: "Images,Documents"
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

>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
            return dto;
        }

        public async Task<ContractorApplicationDto> AcceptContractorApplicationAsync(
            Guid contractorApplicationID
        )
        {
            var contractorApplication = await _unitOfWork.ContractorApplicationRepository.GetAsync(
                ca => ca.ContractorApplicationID == contractorApplicationID,
                includeProperties: "Images, Documents"
            );
            if (contractorApplication == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { APPLICATION, new[] { ERROR_APPLICATION_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                sr => sr.ServiceRequestID == contractorApplication.ServiceRequestID,
                includeProperties: "ContractorApplications"
            );

            if (serviceRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { APPLICATION, new[] { ERROR_SERVICE_REQUEST_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

<<<<<<< HEAD
            contractorApplication.Status = ApplicationStatus.Approved;
=======
            serviceRequest.Status = RequestStatus.Closed;
            contractorApplication.Status = ApplicationStatus.PendingCommission;
<<<<<<< HEAD
            contractorApplication.DueCommisionTime = DateTime.UtcNow.AddDays(7);
=======
>>>>>>> develop
>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
            serviceRequest.SelectedContractorApplicationID = contractorApplicationID;

            if (serviceRequest.ContractorApplications != null)
            {
                foreach (var app in serviceRequest.ContractorApplications)
                {
                    if (app.ContractorApplicationID != contractorApplicationID)
                    {
                        app.Status = ApplicationStatus.Rejected;
                        await _notifier.SendToGroupAsync(
                            $"user_{app.ContractorID}",
                            "ContractorApplication.Rejected",
                            new
                            {
                                ContractorApplicationID = contractorApplication.ContractorApplicationID,
                                ServiceRequestID = contractorApplication.ServiceRequestID,
                                Status = ApplicationStatus.PendingCommission.ToString(),
                                DueCommisionTime = contractorApplication.DueCommisionTime,
                            }
                        );
                    }
                }
            }

            await _unitOfWork.SaveAsync();
            var dto = _mapper.Map<ContractorApplicationDto>(contractorApplication);
            await _notifier.SendToGroupAsync(
                $"user_{dto.ContractorID}",
                "ContractorApplication.Accept",
                new
                {
                    ContractorApplicationID = contractorApplication.ContractorApplicationID,
                    ServiceRequestID = contractorApplication.ServiceRequestID,
                    Status = ApplicationStatus.PendingCommission.ToString(),
                    DueCommisionTime = contractorApplication.DueCommisionTime,
                }
            );
            return dto;
        }

        public async Task<ContractorApplicationDto> RejectContractorApplicationAsync(
            Guid contractorApplicationID
        )
        {
            var contractorApplication = await _unitOfWork.ContractorApplicationRepository.GetAsync(
                ca => ca.ContractorApplicationID == contractorApplicationID,
                includeProperties: "Images,Documents"
            );

            if (contractorApplication == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { APPLICATION, new[] { ERROR_APPLICATION_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            if (contractorApplication.Status != ApplicationStatus.Pending)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { APPLICATION, new[] { "APPLICATION_NOT_PENDING" } },
                };
                throw new CustomValidationException(errors);
            }

            contractorApplication.Status = ApplicationStatus.Rejected;
            await _unitOfWork.SaveAsync();
            var dto = _mapper.Map<ContractorApplicationDto>(contractorApplication);
            await _notifier.SendToGroupAsync(
                $"user_{dto.ContractorID}",
                "ContractorApplication.Rejected",
                new
                {
                    ContractorApplicationID = contractorApplication.ContractorApplicationID,
                    ServiceRequestID = contractorApplication.ServiceRequestID,
                    Status = ApplicationStatus.Rejected.ToString(),
                }
            );
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
            }
<<<<<<< HEAD
            var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(s =>
                s.ServiceRequestID == application.ServiceRequestID
            );
=======
            var documents = await _unitOfWork.DocumentRepository.GetRangeAsync(doc =>
                doc.ContractorApplicationID == id
            );
            if (documents != null && documents.Any())
            {
                foreach (var document in documents)
                {
                    if (!string.IsNullOrEmpty(document.PublicId))
                    {
                        await _unitOfWork.DocumentRepository.DeleteDocumentAsync(document.PublicId);
                    }
                }
            }

>>>>>>> 9135d9f9ecfa922da36234d8cb0327f0a86c11f2
            _unitOfWork.ContractorApplicationRepository.Remove(application);
            await _notifier.SendToGroupAsync(
                $"user_{serviceRequest?.CustomerID}",
                "ContractorApplication.Delete",
                new { application.ServiceRequestID, application.ContractorApplicationID }
            );
            await _notifier.SendToGroupAsync(
                $"role_Admin",
                "ContractorApplication.Delete",
                new { application.ServiceRequestID, application.ContractorApplicationID }
            );
            await _unitOfWork.SaveAsync();
        }
    }
}
