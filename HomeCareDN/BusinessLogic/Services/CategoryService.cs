using AutoMapper;
using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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

        public async Task<IEnumerable<CategoryDto>> GetAllCategoryAsync(CategoryGetAllRequestDto requestDto)
        {
            var category = await _unitOfWork.CategoryRepository.GetAllAsync(
                requestDto.FilterOn,
                requestDto.FilterQuery,
                requestDto.SortBy,
                requestDto.IsAscending,
                requestDto.PageNumber,
                requestDto.PageSize
            );
            if (category == null || !category.Any())
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Category", new[] { "No category found." } },
                };
                throw new CustomValidationException(errors);
            }
            var rsMapper = _mapper.Map<IEnumerable<CategoryDto>>(category);
            return rsMapper;
        }

        public async Task<CategoryDto> GetCategoryByIdAsync(Guid id)
        {
            var category = await _unitOfWork.CategoryRepository.GetAsync(c => c.CategoryID == id);

            if (category == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Category", new[] { "No category found." } },
                };
                throw new CustomValidationException(errors);
            }
            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto> CreateCategoryAsync(CategoryCreateRequestDto requestDto)
        {
            var errors = new Dictionary<string, string[]>();
            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }

            var rsMapper = _mapper.Map<Category>(requestDto);

            await _unitOfWork.CategoryRepository.AddAsync(rsMapper);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<CategoryDto>(rsMapper);
        }

        public async Task<CategoryDto> UpdateCategoryAsync(CategoryUpdateRequestDto requestDto)
        {
            var category = await _unitOfWork.CategoryRepository.GetAsync(c => c.CategoryID == requestDto.CategoryID);
            var errors = new Dictionary<string, string[]>();

            if (category == null)
            {
                errors.Add(
                    "CategoryID",
                    new[] { $"Category request with ID {requestDto.CategoryID} not found." }
                );
                throw new CustomValidationException(errors);
            }

            if (errors.Any())
            {
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
                    { "CategoryID", new[] { $"Category with ID {id} not found." } },
                };
                throw new CustomValidationException(errors);
            }
            _unitOfWork.CategoryRepository.Remove(category);
            await _unitOfWork.SaveAsync();
        }
    }
}
