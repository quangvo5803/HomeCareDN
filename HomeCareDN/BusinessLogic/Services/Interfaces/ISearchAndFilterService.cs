
using BusinessLogic.DTOs.Application.SearchAndFilter;
using DataAccess.Repositories.Interfaces;

namespace BusinessLogic.Services.Interfaces
{
    public interface ISearchAndFilterService
        
    {
        Task<List<SearchResponseDto>> SearchAsync(SearchRequestDto requestDto);

    }
}
