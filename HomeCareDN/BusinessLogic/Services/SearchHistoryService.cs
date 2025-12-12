using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.DTOs.Application.SearchHistory;
using BusinessLogic.DTOs.Application.Service;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogic.Services
{
    public class SearchHistoryService : ISearchHistoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IMaterialService _materialService;
        private readonly IServicesService _servicesService;

        public SearchHistoryService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IMaterialService materialService,
            IServicesService servicesService
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _servicesService = servicesService;
            _materialService = materialService;
        }

        public async Task<SearchHistoryDto?> AddSearchHistory(SearchHistoryCreateRequestDto dto)
        {
            if (dto.UserID == null)
                return null;

            var existing = await _unitOfWork.SearchHistoryRepository.GetAsync(
                h => h.UserID == dto.UserID && h.SearchTerm == dto.SearchTerm,
                asNoTracking: false
            );

            if (existing != null)
            {
                existing.SearchDate = DateTime.UtcNow;
                await _unitOfWork.SaveAsync();
                return _mapper.Map<SearchHistoryDto>(existing);
            }

            var entity = _mapper.Map<SearchHistory>(dto);
            entity.SearchDate = DateTime.UtcNow;

            await _unitOfWork.SearchHistoryRepository.AddAsync(entity);

            var histories = await _unitOfWork.SearchHistoryRepository.GetRangeAsync(
                h => h.UserID == dto.UserID,
                asNoTracking: true
            );

            var excess = histories.OrderByDescending(h => h.SearchDate).Skip(10).ToList();
            if (excess.Any())
                _unitOfWork.SearchHistoryRepository.RemoveRange(excess);

            await _unitOfWork.SaveAsync();

            return _mapper.Map<SearchHistoryDto>(entity);
        }

        public async Task<PagedResultDto<MaterialDto>> SearchMaterialAsync(
            QueryParameters parameters
        )
        {
           if (!parameters.FinalSearch && !string.IsNullOrWhiteSpace(parameters.Search) 
                && parameters.FilterID != null
           )
           {
                var dto = new SearchHistoryCreateRequestDto
                {
                    UserID = parameters.FilterID.ToString(),
                    SearchTerm = parameters.Search,
                };
                await AddSearchHistory(dto);
           }
            return await _materialService.GetAllMaterialAsync(parameters);
        }
        public async Task<PagedResultDto<ServiceDto>> SearchServiceAsync(
            QueryParameters parameters
        )
        {
            if (!parameters.FinalSearch && !string.IsNullOrWhiteSpace(parameters.Search) 
                && parameters.FilterID != null
            )
            {
                var dto = new SearchHistoryCreateRequestDto
                {
                    UserID = parameters.FilterID.ToString(),
                    SearchTerm = parameters.Search,
                };
                await AddSearchHistory(dto);
            }
            return await _servicesService.GetAllServicesAsync(parameters);
        }
        public async Task<PagedResultDto<SearchHistoryDto>> GetAllSearchHistoryAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork.SearchHistoryRepository.GetQueryable();
            if (parameters.FilterID.HasValue)
            {
                query = query.Where(c => c.UserID == parameters.FilterID.ToString());
            }
            query = query.OrderByDescending(h => h.SearchDate).Take(5);

            var totalCount = await query.CountAsync();

            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

            var items = await query.ToListAsync();

            var dtos = _mapper.Map<IEnumerable<SearchHistoryDto>>(items);
            return new PagedResultDto<SearchHistoryDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }
    }
}
