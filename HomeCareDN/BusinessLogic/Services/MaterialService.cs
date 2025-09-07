using AutoMapper;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Http;
using Ultitity.Exceptions;
using Ultitity.Extensions;

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

        public async Task<ICollection<MaterialDto>> GetAllMaterialAsync()
        {
            var material = await _unitOfWork.MaterialRepository.GetAllAsync(
                includeProperties: "Images,Brand,Category"
            );
            return _mapper.Map<ICollection<MaterialDto>>(material);
        }

        public async Task<ICollection<MaterialDto>> GetAllMaterialByIdAsync(Guid id)
        {
            var material = await _unitOfWork.MaterialRepository.GetRangeAsync(
                m => m.UserID == id.ToString(),
                includeProperties: "Images,Category,Brand"
            );
            return _mapper.Map<ICollection<MaterialDto>>(material);
        }

        public async Task<MaterialDto> CreateMaterialAsync(MaterialCreateRequestDto requestDto)
        {
            //check image
            ValidateImages(requestDto.Images);

            var material = _mapper.Map<Material>(requestDto);

            await _unitOfWork.MaterialRepository.AddAsync(material);
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
                includeProperties: "Images,Category"
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
                includeProperties: "Images,Category"
            );

            var errors = new Dictionary<string, string[]>();

            if (material == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Material", new[] { ERROR_MATERIAL_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            if (requestDto.Images != null)
            {
                if (requestDto.Images.Count > 5)
                {
                    errors.Add(
                        nameof(requestDto.Images),
                        new[] { "You can only upload a maximum of 5 images." }
                    );
                }

        public async Task DeleteMaterialImageAsync(string imageUrl)
        {
            var image = await _unitOfWork.ImageRepository.GetAsync(img => img.ImageUrl == imageUrl);

            if (image == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "ImageUrl", new[] { ERROR_IMAGE_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
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
