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
        private const string ERROR_MAXIMUM_IMAGE_SIZE = "MAXIMUM_IMAGE_SIZE";

        public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResultDto<CategoryDto>> GetAllCategories(QueryParameters parameters)
        {
            var query = _unitOfWork.CategoryRepository.GetQueryable(
                includeProperties: "Materials,LogoImage"
            );
            if (parameters.FilterID.HasValue)
            {
                query = query.Where(c => c.UserID == parameters.FilterID);
            }
            if (parameters.FilterBool.HasValue)
            {
                query = query.Where(c => c.IsActive == parameters.FilterBool);
            }

            var totalCount = await query.CountAsync();
            if (parameters.SortBy?.ToLower() == "random")
            {
                var random = new Random();
                var skip = random.Next(0, Math.Max(0, totalCount - parameters.PageSize));
                query = query.OrderBy(c => c.CategoryID).Skip(skip).Take(parameters.PageSize);
            }
            else
            {
                query = parameters.SortBy?.ToLower() switch
                {
                    "categoryname" => query.OrderBy(c => c.CategoryName),
                    "categoryname_desc" => query.OrderByDescending(c => c.CategoryName),
                    "categorynameen" => query.OrderBy(c => c.CategoryNameEN),
                    "categorynameen_desc" => query.OrderByDescending(c => c.CategoryNameEN),
                    _ => query.OrderBy(c => c.CategoryID),
                };

                query = query
                    .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                    .Take(parameters.PageSize);
            }

            var items = await query.ToListAsync();

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
            var category = await _unitOfWork.CategoryRepository.GetAsync(
                c => c.CategoryID == id,
                includeProperties: "Materials,LogoImage"
            );

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
            var category = _mapper.Map<Category>(requestDto);

            await _unitOfWork.CategoryRepository.AddAsync(category);
            if (requestDto.LogoFile != null)
            {
                var errors = new Dictionary<string, string[]>();
                if (requestDto.LogoFile.Length > 5 * 1024 * 1024)
                {
                    errors.Add("LogoFile", new[] { ERROR_MAXIMUM_IMAGE_SIZE });
                    throw new CustomValidationException(errors);
                }
                Image imageUpload = new Image
                {
                    ImageID = Guid.NewGuid(),
                    CategoryID = category.CategoryID,
                    ImageUrl = "",
                };
                await _unitOfWork.ImageRepository.UploadImageAsync(
                    requestDto.LogoFile,
                    "HomeCareDN/CategoryLogo",
                    imageUpload
                );
                category.CategoryLogoID = imageUpload.ImageID;
            }
            await _unitOfWork.SaveAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto> UpdateCategoryAsync(CategoryUpdateRequestDto requestDto)
        {
            var category = await _unitOfWork.CategoryRepository.GetAsync(
                c => c.CategoryID == requestDto.CategoryID,
                includeProperties: "LogoImage,Materials"
            );
            var errors = new Dictionary<string, string[]>();

            if (category == null)
            {
                errors.Add("Category", new[] { "CATEGORY_NOT_FOUND" });
                throw new CustomValidationException(errors);
            }
            _mapper.Map(requestDto, category);
            if (requestDto.LogoFile != null)
            {
                if (requestDto.LogoFile.Length > 5 * 1024 * 1024)
                {
                    errors.Add("LogoFile", new[] { ERROR_MAXIMUM_IMAGE_SIZE });
                    throw new CustomValidationException(errors);
                }
                var existingImage = await _unitOfWork.ImageRepository.GetAsync(img =>
                    img.CategoryID == category.CategoryID
                );
                if (existingImage != null)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(existingImage.PublicId);
                }
                Image imageUpload = new Image
                {
                    ImageID = Guid.NewGuid(),
                    CategoryID = category.CategoryID,
                    ImageUrl = "",
                };
                await _unitOfWork.ImageRepository.UploadImageAsync(
                    requestDto.LogoFile,
                    "HomeCareDN/CategoryLogo",
                    imageUpload
                );
                category.CategoryLogoID = imageUpload.ImageID;
            }
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
            var image = await _unitOfWork.ImageRepository.GetAsync(image => image.CategoryID == id);
            if (image != null)
            {
                await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
            }
            _unitOfWork.CategoryRepository.Remove(category);
            await _unitOfWork.SaveAsync();
        }
    }
}
