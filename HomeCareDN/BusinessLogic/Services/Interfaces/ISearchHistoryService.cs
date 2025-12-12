using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.DTOs.Application.SearchHistory;
using BusinessLogic.DTOs.Application.Service;

namespace BusinessLogic.Services.Interfaces
{
    public interface ISearchHistoryService
    {
        Task<SearchHistoryDto?> AddSearchHistory(SearchHistoryCreateRequestDto dto);
        Task<PagedResultDto<MaterialDto>> SearchMaterialAsync(QueryParameters parameters);
        Task<PagedResultDto<ServiceDto>> SearchServiceAsync(QueryParameters parameters);

        Task<PagedResultDto<SearchHistoryDto>> GetAllSearchHistoryAsync(QueryParameters parameters);
    }
}