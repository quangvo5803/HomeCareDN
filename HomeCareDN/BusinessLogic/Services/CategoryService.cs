using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Category;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;
using static Org.BouncyCastle.Asn1.Cmp.Challenge;

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
            var query = _unitOfWork.CategoryRepository.GetQueryable(
                includeProperties: "Materials,LogoImage"
            );

            if (!string.IsNullOrEmpty(parameters.Search))
            {
                string searchLower = parameters.Search.ToLower();
                query = query.Where(c =>
                    c.CategoryName.ToLower().Contains(searchLower)
                    || (
                        !string.IsNullOrEmpty(c.CategoryNameEN)
                        && c.CategoryNameEN.ToLower().Contains(searchLower)
                    )
                );
            }
            if (parameters.FilterID.HasValue)
            {
                query = query.Where(c => c.UserID == parameters.FilterID);
            }
            if (parameters.FilterBool.HasValue)
            {
                query = query.Where(c => c.IsActive == parameters.FilterBool);
            }

            var totalCount = await query.CountAsync();

            query = parameters.SortBy switch
            {
                "categoryname" => query.OrderBy(c => c.CategoryName),
                "categoryname_desc" => query.OrderByDescending(c => c.CategoryName),
                "categorynameen" => query.OrderBy(c => c.CategoryNameEN ?? c.CategoryName),
                "categorynameen_desc" => query.OrderByDescending(c =>
                    c.CategoryNameEN ?? c.CategoryName
                ),
                "materialcount" => query.OrderBy(b => (int?)b.Materials!.Count ?? 0),
                "materialcount_desc" => query.OrderByDescending(b => (int?)b.Materials!.Count ?? 0),
                "random" => query.OrderBy(s => s.CategoryID),
                _ => query.OrderBy(c => c.CreatedAt),
            };

            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

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
            if (
                await _unitOfWork
                    .CategoryRepository.GetQueryable()
                    .AnyAsync(c => c.CategoryName == requestDto.CategoryName)
            )
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { "CategoryName", new[] { "CATEGORY_NAME_ALREADY_EXISTS" } },
                    }
                );
            }
            var category = _mapper.Map<Category>(requestDto);
            category.CategoryID = Guid.NewGuid();

            Image imageUpload = new Image
            {
                ImageID = Guid.NewGuid(),
                CategoryID = category.CategoryID,
                ImageUrl = requestDto.CategoryLogoUrl,
                PublicId = requestDto.CategoryLogoPublicId,
            };
            category.CategoryLogoID = imageUpload.ImageID;

            await _unitOfWork.ImageRepository.AddAsync(imageUpload);
            await _unitOfWork.CategoryRepository.AddAsync(category);

            await _unitOfWork.SaveAsync();
            var categoryDto = _mapper.Map<CategoryDto>(category);
            return categoryDto;
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
            if (
                await _unitOfWork
                    .CategoryRepository.GetQueryable()
                    .AnyAsync(c =>
                        c.CategoryID != requestDto.CategoryID
                        && c.CategoryName == requestDto.CategoryName
                    )
            )
            {
                errors.Add("CategoryName", new[] { "CATEGORY_NAME_ALREADY_EXISTS" });
                throw new CustomValidationException(errors);
            }
            _mapper.Map(requestDto, category);
            if (
                !string.IsNullOrEmpty(requestDto.CategoryLogoUrl)
                && !string.IsNullOrEmpty(requestDto.CategoryLogoPublicId)
            )
            {
                if (category.CategoryLogoID.HasValue)
                {
                    var oldImage = await _unitOfWork.ImageRepository.GetAsync(i =>
                        i.ImageID == category.CategoryLogoID.Value
                    );
                    if (oldImage != null)
                    {
                        await _unitOfWork.ImageRepository.DeleteImageAsync(oldImage.PublicId);
                    }
                }
                var imageUpload = new Image
                {
                    ImageID = Guid.NewGuid(),
                    CategoryID = category.CategoryID,
                    ImageUrl = requestDto.CategoryLogoUrl,
                    PublicId = requestDto.CategoryLogoPublicId,
                };

                await _unitOfWork.ImageRepository.AddAsync(imageUpload);
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
