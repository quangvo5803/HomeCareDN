using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Category;

namespace BusinessLogic.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<PagedResultDto<CategoryDto>> GetAllCategories(QueryParameters parameters);
        Task<CategoryDto> GetCategoryByIdAsync(Guid id);
        Task<CategoryDto> CreateCategoryAsync(CategoryCreateRequestDto requestDto);
        Task<CategoryDto> UpdateCategoryAsync(CategoryUpdateRequestDto requestDto);
        Task DeleteCategoryAsync(Guid id);
    }
}
