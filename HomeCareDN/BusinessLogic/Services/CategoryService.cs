using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResultDto<CategoryDto>> GetAllCategories(QueryParameters parameters)
        {
            var query = _unitOfWork.CategoryRepository.GetQueryable(includeProperties: "Materials");
            var totalCount = await query.CountAsync();
            query = parameters.SortBy?.ToLower() switch
            {
                "categoryname" => query.OrderBy(c => c.CategoryName),
                "categoryname_desc" => query.OrderByDescending(c => c.CategoryName),
                "categorynameen" => query.OrderBy(c => c.CategoryNameEN),
                "categorynameen_desc" => query.OrderByDescending(c => c.CategoryNameEN),
                "random" => query.OrderBy(c => Guid.NewGuid()),
                _ => query.OrderBy(c => c.CategoryID),
            };
            var items = await query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<IEnumerable<CategoryDto>>(items);
            return new PagedResultDto<CategoryDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<CategoryDto> GetCategoryByIdAsync(Guid id)
        {
            var category = await _unitOfWork.CategoryRepository.GetAsync(c => c.CategoryID == id);

            if (category == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Category", new[] { "CATEGORY_NOT_FOUND" } },
                };
                throw new CustomValidationException(errors);
            }
            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto> CreateCategoryAsync(CategoryCreateRequestDto requestDto)
        {
            var rsMapper = _mapper.Map<Category>(requestDto);

            await _unitOfWork.CategoryRepository.AddAsync(rsMapper);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<CategoryDto>(rsMapper);
        }

        public async Task<CategoryDto> UpdateCategoryAsync(CategoryUpdateRequestDto requestDto)
        {
            var category = await _unitOfWork.CategoryRepository.GetAsync(c =>
                c.CategoryID == requestDto.CategoryID
            );
            var errors = new Dictionary<string, string[]>();

            if (category == null)
            {
                errors.Add("Category", new[] { "CATEGORY_NOT_FOUND" });
                throw new CustomValidationException(errors);
            }
            _mapper.Map(requestDto, category);

            await _unitOfWork.SaveAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task DeleteCategoryAsync(Guid id)
        {
            var category = await _unitOfWork.CategoryRepository.GetAsync(c => c.CategoryID == id);
            if (category == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Category", new[] { "CATEGORY_NOT_FOUND" } },
                };
                throw new CustomValidationException(errors);
            }
            _unitOfWork.CategoryRepository.Remove(category);
            await _unitOfWork.SaveAsync();
        }
    }
}
