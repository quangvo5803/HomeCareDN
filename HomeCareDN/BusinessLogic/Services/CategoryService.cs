using AutoMapper;
using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Ultitity.Exceptions;
using Ultitity.Extensions;

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

        public async Task<ICollection<CategoryDto>> GetAllCategories()
        {
            var categories = await _unitOfWork.CategoryRepository.GetAllAsync(
                includeProperties: "Materials"
            );
            var categoiresDtos = _mapper.Map<ICollection<CategoryDto>>(categories);
            return categoiresDtos;
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
            _mapper.Map(category, requestDto);

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
