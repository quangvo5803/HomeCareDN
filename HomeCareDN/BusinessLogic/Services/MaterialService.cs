using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class MaterialService : IMaterialService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private const string ERROR_MAXIMUM_IMAGE = "MAXIMUM_IMAGE";
        private const string ERROR_MAXIMUM_IMAGE_SIZE = "MAXIMUM_IMAGE_SIZE";
        private const string ERROR_MATERIAL_NOT_FOUND = "MATERIAL_NOT_FOUND";
        private const string ERROR_IMAGE_NOT_FOUND = "IMAGE_NOT_FOUND";

        public MaterialService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PagedResultDto<MaterialDto>> GetAllMaterialAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork.MaterialRepository.GetQueryable(
                includeProperties: "Images,Brand,Category"
            );
            var totalCount = await query.CountAsync();
            query = parameters.SortBy?.ToLower() switch
            {
                "materialname" => query.OrderBy(m => m.Name),
                "materialname_desc" => query.OrderByDescending(m => m.Name),
                "materialnameen" => query.OrderBy(m => m.NameEN),
                "materialnameen_desc" => query.OrderByDescending(m => m.NameEN),
                "random" => query.OrderBy(b => Guid.NewGuid()),
                _ => query.OrderBy(b => b.NameEN),
            };
            var items = await query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync();
            return new PagedResultDto<MaterialDto>
            {
                Items = _mapper.Map<IEnumerable<MaterialDto>>(items),
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
                includeProperties: "Images,Brand,Category"
            );
            query = query.Where(m => m.UserID == parameters.FilterID.ToString());
            var totalCount = await query.CountAsync();
            query = parameters.SortBy?.ToLower() switch
            {
                "materialname" => query.OrderBy(m => m.Name),
                "materialname_desc" => query.OrderByDescending(m => m.Name),
                "materialnameen" => query.OrderBy(m => m.NameEN),
                "materialnameen_desc" => query.OrderByDescending(m => m.NameEN),
                "random" => query.OrderBy(b => Guid.NewGuid()),
                _ => query.OrderBy(b => b.MaterialID),
            };
            var items = await query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync();
            return new PagedResultDto<MaterialDto>
            {
                Items = _mapper.Map<IEnumerable<MaterialDto>>(items),
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<MaterialDto> CreateMaterialAsync(MaterialCreateRequestDto requestDto)
        {
            //check image
            ValidateImages(requestDto.Images);

            var material = _mapper.Map<Material>(requestDto);
            await _unitOfWork.MaterialRepository.AddAsync(material);

            //upload image
            await UploadMaterialImagesAsync(material.MaterialID, requestDto.Images);

            await _unitOfWork.SaveAsync();

            material = await _unitOfWork.MaterialRepository.GetAsync(
                m => m.MaterialID == material.MaterialID,
                includeProperties: "Category,Brand"
            );
            return _mapper.Map<MaterialDto>(material);
        }

        public async Task<MaterialDto> GetMaterialByIdAsync(Guid id)
        {
            var material = await _unitOfWork.MaterialRepository.GetAsync(
                m => m.MaterialID == id,
                includeProperties: "Images,Category,Brand"
            );

            if (material == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Material", new[] { ERROR_MATERIAL_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            return _mapper.Map<MaterialDto>(material);
        }

        public async Task<MaterialDto> UpdateMaterialAsync(MaterialUpdateRequestDto requestDto)
        {
            var material = await _unitOfWork.MaterialRepository.GetAsync(
                m => m.MaterialID == requestDto.MaterialID,
                includeProperties: "Images,Category,Brand"
            );

            //check image
            ValidateImages(requestDto.Images, material!.Images?.Count ?? 0);

            _mapper.Map(requestDto, material);

            //upload image
            await UploadMaterialImagesAsync(material.MaterialID, requestDto.Images);

            await _unitOfWork.SaveAsync();
            return _mapper.Map<MaterialDto>(material);
        }

        public async Task DeleteMaterialAsync(Guid id)
        {
            var material = await _unitOfWork.MaterialRepository.GetAsync(m => m.MaterialID == id);

            if (material == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Material", new[] { ERROR_MATERIAL_NOT_FOUND } },
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

        public async Task DeleteMaterialImageAsync(string imageUrl)
        {
            var request = await _unitOfWork.ImageRepository.GetAsync(img =>
                img.ImageUrl == imageUrl
            );

            if (request == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "ImageUrl", new[] { ERROR_IMAGE_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            await _unitOfWork.ImageRepository.DeleteImageAsync(request.PublicId);
            await _unitOfWork.SaveAsync();
        }

        private static void ValidateImages(ICollection<IFormFile>? images, int existingCount = 0)
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
            ICollection<IFormFile>? images
        )
        {
            foreach (var image in images ?? Enumerable.Empty<IFormFile>())
            {
                var imageUpload = new Image
                {
                    ImageID = Guid.NewGuid(),
                    MaterialID = materialId,
                    ImageUrl = "",
                };
                await _unitOfWork.ImageRepository.UploadImageAsync(
                    image,
                    "HomeCareDN/Material",
                    imageUpload
                );
            }
        }
    }
}
