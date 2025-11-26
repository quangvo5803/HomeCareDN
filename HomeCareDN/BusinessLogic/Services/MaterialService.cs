using System.Linq.Expressions;
using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class MaterialService : IMaterialService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private const string MATERIAL = "Material";
        private const string ERROR_MAXIMUM_IMAGE = "MAXIMUM_IMAGE";
        private const string ERROR_MAXIMUM_IMAGE_SIZE = "MAXIMUM_IMAGE_SIZE";
        private const string ERROR_MATERIAL_NOT_FOUND = "MATERIAL_NOT_FOUND";
        private const string MATERIAL_INCLUDE = "Images,Category,Brand";

        public MaterialService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            UserManager<ApplicationUser> userManager
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userManager = userManager;
        }

        public async Task<PagedResultDto<MaterialDto>> GetAllMaterialAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork.MaterialRepository.GetQueryable(
                includeProperties: MATERIAL_INCLUDE
            );
            if (parameters.ExcludedID != null)
            {
                query = query.Where(m => m.MaterialID != parameters.ExcludedID);
            }
            if (!string.IsNullOrEmpty(parameters.Search))
            {
                var searchUpper = parameters.Search.ToUpper();

                query = query.Where(await SearchMaterialAsync(searchUpper));
            }

            if (parameters.FilterCategoryID.HasValue)
            {
                query = query.Where(m => m.CategoryID == parameters.FilterCategoryID.Value);
            }
            if (parameters.FilterBrandID.HasValue)
            {
                query = query.Where(m => m.BrandID == parameters.FilterBrandID.Value);
            }
            var totalCount = await query.CountAsync();

            query = parameters.SortBy switch
            {
                "materialname" => query.OrderBy(m => m.Name),
                "materialname_desc" => query.OrderByDescending(m => m.Name),
                "materialnameen" => query.OrderBy(m => m.NameEN ?? m.Name),
                "materialnameen_desc" => query.OrderByDescending(m => m.NameEN ?? m.Name),
                "random" => query.OrderBy(b => b.MaterialID),
                _ => query.OrderBy(m => m.CreatedAt),
            };
            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

            var items = await query.ToListAsync();
            var dtos = _mapper.Map<IEnumerable<MaterialDto>>(items);
            foreach (var dto in dtos)
            {
                var user = await _userManager.FindByIdAsync(dto.UserID);
                dto.UserName = user?.FullName;
            }
            return new PagedResultDto<MaterialDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<PagedResultDto<MaterialDto>> GetAllMaterialByUserIdAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork.MaterialRepository.GetQueryable(
                includeProperties: MATERIAL_INCLUDE
            );
            query = query.Where(m => m.UserID == parameters.FilterID.ToString());
            var totalCount = await query.CountAsync();
            query = parameters.SortBy?.ToLower() switch
            {
                "materialname" => query.OrderBy(m => m.Name),
                "materialname_desc" => query.OrderByDescending(m => m.Name),
                "materialnameen" => query.OrderBy(m => m.NameEN),
                "materialnameen_desc" => query.OrderByDescending(m => m.NameEN),
                "random" => query.OrderBy(m => m.MaterialID),
                _ => query.OrderBy(b => b.MaterialID),
            };
            var items = await query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync();
            var dtos = _mapper.Map<IEnumerable<MaterialDto>>(items);
            foreach (var dto in dtos)
            {
                var user = await _userManager.FindByIdAsync(dto.UserID);
                dto.UserName = user?.FullName;
            }
            return new PagedResultDto<MaterialDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<MaterialDetailDto> GetMaterialByIdAsync(Guid id)
        {
            var material = await _unitOfWork.MaterialRepository.GetAsync(
                m => m.MaterialID == id,
                includeProperties: MATERIAL_INCLUDE
            );

            if (material == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { MATERIAL, new[] { ERROR_MATERIAL_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            return _mapper.Map<MaterialDetailDto>(material);
        }

        public async Task<MaterialDto> GetMaterialByCategoryAsync(Guid id)
        {
            var material = await _unitOfWork.MaterialRepository.GetAsync(
                m => m.CategoryID == id,
                includeProperties: MATERIAL_INCLUDE
            );
            if (material == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { MATERIAL, new[] { ERROR_MATERIAL_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            return _mapper.Map<MaterialDto>(material);
        }

        public async Task<MaterialDto> GetMaterialByBrandAsync(Guid id)
        {
            var material = await _unitOfWork.MaterialRepository.GetAsync(
                m => m.BrandID == id,
                includeProperties: MATERIAL_INCLUDE
            );

            if (material == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { MATERIAL, new[] { ERROR_MATERIAL_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            return _mapper.Map<MaterialDto>(material);
        }

        public async Task<MaterialDto> CreateMaterialAsync(MaterialCreateRequestDto requestDto)
        {
            var material = _mapper.Map<Material>(requestDto);
            await _unitOfWork.MaterialRepository.AddAsync(material);
            //check image
            ValidateImages(requestDto.ImageUrls, 0);

            //upload image
            await UploadMaterialImagesAsync(
                material.MaterialID,
                requestDto.ImageUrls,
                requestDto.ImagePublicIds
            );

            await _unitOfWork.SaveAsync();

            material = await _unitOfWork.MaterialRepository.GetAsync(
                m => m.MaterialID == material.MaterialID,
                includeProperties: MATERIAL_INCLUDE
            );
            return _mapper.Map<MaterialDto>(material);
        }

        public async Task<MaterialDto> UpdateMaterialAsync(MaterialUpdateRequestDto requestDto)
        {
            var material = await _unitOfWork.MaterialRepository.GetAsync(
                m => m.MaterialID == requestDto.MaterialID,
                includeProperties: MATERIAL_INCLUDE,
                false
            );
            var errors = new Dictionary<string, string[]>();

            //check image
            ValidateImages(requestDto.ImageUrls, material!.Images?.Count ?? 0);

            _mapper.Map(requestDto, material);

            //upload image
            await UploadMaterialImagesAsync(
                material.MaterialID,
                requestDto.ImageUrls,
                requestDto.ImagePublicIds
            );

            await _unitOfWork.SaveAsync();
            material = await _unitOfWork.MaterialRepository.GetAsync(
                m => m.MaterialID == requestDto.MaterialID,
                includeProperties: MATERIAL_INCLUDE
            );
            return _mapper.Map<MaterialDto>(material);
        }

        public async Task DeleteMaterialAsync(Guid id)
        {
            var material = await _unitOfWork.MaterialRepository.GetAsync(
                m => m.MaterialID == id,
                asNoTracking: false
            );

            if (material == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { MATERIAL, new[] { ERROR_MATERIAL_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            var images = await _unitOfWork.ImageRepository.GetRangeAsync(i => i.MaterialID == id);
            if (images != null && images.Any())
            {
                foreach (var image in images)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }

            _unitOfWork.MaterialRepository.Remove(material!);
            await _unitOfWork.SaveAsync();
        }

        private static void ValidateImages(ICollection<string>? images, int existingCount = 0)
        {
            var errors = new Dictionary<string, string[]>();

            if (images == null)
                return;

            var totalCount = existingCount + images.Count;
            if (totalCount > 5)
            {
                errors.Add(nameof(images), new[] { ERROR_MAXIMUM_IMAGE });
            }

            if (images.Any(i => i.Length > 5 * 1024 * 1024))
            {
                errors.Add(nameof(images), new[] { ERROR_MAXIMUM_IMAGE_SIZE });
            }

            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }
        }

        private async Task UploadMaterialImagesAsync(
            Guid materialId,
            ICollection<string>? imageUrls,
            ICollection<string>? publicIds
        )
        {
            if (imageUrls == null || !imageUrls.Any())
                return;

            var ids = publicIds?.ToList() ?? new List<string>();

            var images = imageUrls
                .Select(
                    (url, i) =>
                        new Image
                        {
                            ImageID = Guid.NewGuid(),
                            MaterialID = materialId,
                            ImageUrl = url,
                            PublicId = i < ids.Count ? ids[i] : string.Empty,
                        }
                )
                .ToList();

            await _unitOfWork.ImageRepository.AddRangeAsync(images);
        }

        private async Task<Expression<Func<Material, bool>>> SearchMaterialAsync(string searchUpper)
        {
            var matchingUserIds = await _userManager
                .Users.Where(u => u.FullName.ToUpper().Contains(searchUpper))
                .Select(u => u.Id)
                .ToListAsync();

            return m =>
                (!string.IsNullOrEmpty(m.Name) && m.Name.ToUpper().Contains(searchUpper))
                || (!string.IsNullOrEmpty(m.NameEN) && m.NameEN.ToUpper().Contains(searchUpper))
                || (
                    !string.IsNullOrEmpty(m.Description)
                    && m.Description.ToUpper().Contains(searchUpper)
                )
                || (
                    m.Brand != null
                    && (
                        (
                            !string.IsNullOrEmpty(m.Brand.BrandName)
                            && m.Brand.BrandName.ToUpper().Contains(searchUpper)
                        )
                        || (
                            !string.IsNullOrEmpty(m.Brand.BrandNameEN)
                            && m.Brand.BrandNameEN.ToUpper().Contains(searchUpper)
                        )
                    )
                )
                || (
                    m.Category != null
                    && (
                        (
                            !string.IsNullOrEmpty(m.Category.CategoryName)
                            && m.Category.CategoryName.ToUpper().Contains(searchUpper)
                        )
                        || (
                            !string.IsNullOrEmpty(m.Category.CategoryNameEN)
                            && m.Category.CategoryNameEN.ToUpper().Contains(searchUpper)
                        )
                    )
                )
                || matchingUserIds.Contains(m.UserID);
        }

        public async Task<bool> CheckMaterialExisiting(string materialName, Guid? materialId = null)
        {
            var existing = await _unitOfWork.MaterialRepository.GetAsync(m =>
                (!materialId.HasValue || m.BrandID != materialId.Value)
                && (m.Name == materialName || m.NameEN == materialName)
            );
            return existing != null;
        }
    }
}
