using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.MaterialRequest;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class MaterialRequestService : IMaterialRequestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        private const string INCLUDE =
            "MaterialRequestItems,DistributorApplications,SelectedDistributorApplication";
        private const string ERROR_MATERIAL_SERVICE = "MATERIAL_SERVICE";
        private const string ERROR_MATERIAL_SERVICE_NOT_FOUND = "MATERIAL_SERVICE_NOT_FOUND";

        public MaterialRequestService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResultDto<MaterialRequestDto>> GetAllMaterialRequestsAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork.MaterialRequestRepository.GetQueryable(
                includeProperties: INCLUDE
            );
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
            var dtos = _mapper.Map<IEnumerable<MaterialRequestDto>>(items);

            return new PagedResultDto<MaterialRequestDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<PagedResultDto<MaterialRequestDto>> GetAllMaterialRequestByUserIdAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork
                .MaterialRequestRepository.GetQueryable(includeProperties: INCLUDE)
                .Where(m => m.CustomerID == parameters.FilterID);
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
            var dtos = _mapper.Map<IEnumerable<MaterialRequestDto>>(items);

            return new PagedResultDto<MaterialRequestDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<MaterialRequestDto> CreateNewMaterialRequestAsync(
            MaterialRequestCreateRequestDto materialRequestCreateDto
        )
        {
            var materialRequest = new MaterialRequest();
            materialRequest.MaterialRequestID = Guid.NewGuid();
            materialRequest.CustomerID = materialRequestCreateDto.CustomerID;
            if (materialRequestCreateDto.FirstMaterialID.HasValue)
            {
                var materialRequestItem = new MaterialRequestItem();
                materialRequestItem.MaterialRequestID = materialRequest.MaterialRequestID;
                materialRequestItem.MaterialID = materialRequestCreateDto.FirstMaterialID.Value;
                await _unitOfWork.MaterialRequestItemRepository.AddAsync(materialRequestItem);
            }
            await _unitOfWork.MaterialRequestRepository.AddAsync(materialRequest);
            await _unitOfWork.SaveAsync();
            var dto = _mapper.Map<MaterialRequestDto>(materialRequest);
            return dto;
        }

        public async Task<MaterialRequestDto> GetMaterialRequestByIdAsync(Guid materialRequestID)
        {
            var materialRequest = await _unitOfWork.MaterialRequestRepository.GetAsync(
                m => m.MaterialRequestID == materialRequestID,
                includeProperties: INCLUDE
            );
            if (materialRequest == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ERROR_MATERIAL_SERVICE, new[] { ERROR_MATERIAL_SERVICE_NOT_FOUND } },
                    }
                );
            }
            var dto = _mapper.Map<MaterialRequestDto>(materialRequest);
            return dto;
        }

        public async Task<MaterialRequestDto> UpdateMaterialRequestAsync(
            MaterialRequestUpdateRequestDto materialRequestUpdateRequestDto
        )
        {
            var materialRequest = await _unitOfWork.MaterialRequestRepository.GetAsync(
                m => m.MaterialRequestID == materialRequestUpdateRequestDto.MaterialRequestID,
                includeProperties: INCLUDE
            );

            if (materialRequest == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ERROR_MATERIAL_SERVICE, new[] { ERROR_MATERIAL_SERVICE_NOT_FOUND } },
                    }
                );
            }

            if (materialRequestUpdateRequestDto.DeleteItemIDs != null)
            {
                foreach (var itemId in materialRequestUpdateRequestDto.DeleteItemIDs)
                {
                    var item = materialRequest.MaterialRequestItems?.FirstOrDefault(m =>
                        m.MaterialRequestItemID == itemId
                    );
                    if (item != null)
                    {
                        _unitOfWork.MaterialRequestItemRepository.Remove(item);
                    }
                }
            }

            if (materialRequestUpdateRequestDto.UpdateItems != null)
            {
                foreach (var updateDto in materialRequestUpdateRequestDto.UpdateItems)
                {
                    var updateItem = await _unitOfWork.MaterialRequestItemRepository.GetAsync(i =>
                        i.MaterialRequestItemID == updateDto.MaterialRequestItemID
                    );
                    if (updateItem != null)
                    {
                        updateItem.Quantity = updateDto.Quantity;
                    }
                }
            }
            if (materialRequestUpdateRequestDto.AddItems != null)
            {
                foreach (var newItem in materialRequestUpdateRequestDto.AddItems)
                {
                    await _unitOfWork.MaterialRequestItemRepository.AddAsync(
                        new MaterialRequestItem
                        {
                            MaterialRequestID = materialRequestUpdateRequestDto.MaterialRequestID,
                            MaterialID = newItem.MaterialID,
                            Quantity = newItem.Quantity,
                        }
                    );
                }
            }
            await _unitOfWork.SaveAsync();
            var dto = _mapper.Map<MaterialRequestDto>(materialRequest);
            return dto;
        }

        public async Task DeleteMaterialRequest(Guid materialRequestID)
        {
            var materialRequest = await _unitOfWork.MaterialRequestRepository.GetAsync(m =>
                m.MaterialRequestID == materialRequestID
            );
            if (materialRequest != null)
            {
                _unitOfWork.MaterialRequestRepository.Remove(materialRequest);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
