using BusinessLogic.DTOs.Application.SearchAndFilter;
using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;

namespace BusinessLogic.Services
{
    public class SearchAndFilterService: ISearchAndFilterService

    {
        private readonly IUnitOfWork _unitOfWork;

        public SearchAndFilterService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Task<List<SearchResponseDto>> SearchAsync(SearchRequestDto requestDto)
        {
            throw new NotImplementedException();
        }
    }
}
