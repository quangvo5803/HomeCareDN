using System.Threading.Tasks;
using AutoMapper;
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Ultitity.Exceptions;

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

        public async Task<List<ContractorApplicationDto>> GetAllContractorApplicationsAsync(
            ContractorApplicationGetAllRequestDto getAllRequestDto
        )
        {
            var applications = await _unitOfWork.ContractorApplicationRepository.GetAllAsync(
                getAllRequestDto.FilterOn,
                getAllRequestDto.FilterQuery,
                getAllRequestDto.SortBy,
                getAllRequestDto.IsAscending,
                getAllRequestDto.PageNumber,
                getAllRequestDto.PageSize,
                includeProperties: "Images"
            );
            if (applications == null || !applications.Any())
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "ContractorApplications", new[] { "No contractor applications found." } },
                };
                throw new CustomValidationException(errors);
            }
            return _mapper.Map<List<ContractorApplicationDto>>(applications);
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
                includeProperties: "Images",
                requestDto.SortBy,
                requestDto.IsAscending,
                requestDto.PageNumber,
                requestDto.PageSize
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
            ;
            var errors = new Dictionary<string, string[]>();

            if (createRequestDto == null)
            {
                errors.Add(
                    "ContractorApplication",
                    new[] { "Contractor application creation request cannot be null." }
                );
            }
            if (createRequestDto?.Images != null && createRequestDto.Images.Count > 5)
            {
                errors.Add(
                    "Images",
                    new[] { "A maximum of 5 images can be uploaded for a contractor application." }
                );
            }
            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }
            var contractorApplication = _mapper.Map<ContractorApplication>(createRequestDto);
            await _unitOfWork.ContractorApplicationRepository.AddAsync(contractorApplication);
            await _unitOfWork.SaveAsync();
            return _mapper.Map<ContractorApplicationDto>(contractorApplication);
        }

        public async Task<ContractorApplicationDto> UpdateContractorApplicationAsync(
            ContractorApplicationUpdateRequestDto updateRequestDto
        )
        {
            var application = await _unitOfWork.ContractorApplicationRepository.GetAsync(ca =>
                ca.ContractorApplicationID == updateRequestDto.ContractorApplicationID
            );
            if (application == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    {
                        "ContractorApplicationID",
                        new[]
                        {
                            $"Contractor application with ID {updateRequestDto.ContractorApplicationID} not found.",
                        }
                    },
                };
                throw new CustomValidationException(errors);
            }
            _mapper.Map(updateRequestDto, application);
            await _unitOfWork.SaveAsync();

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
            _unitOfWork.ContractorApplicationRepository.Remove(application);
            await _unitOfWork.SaveAsync();
        }
    }
}
