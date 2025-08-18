using BusinessLogic.DTOs.Application.Category;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllCategoryAsync(CategoryGetAllRequestDto requestDto);
        Task<CategoryDto> GetCategoryByIdAsync(Guid id);
        Task<CategoryDto> CreateCategoryAsync(CategoryCreateRequestDto requestDto);
        Task<CategoryDto> UpdateCategoryAsync(CategoryUpdateRequestDto requestDto);
        Task DeleteCategoryAsync(Guid id);
    }
}
