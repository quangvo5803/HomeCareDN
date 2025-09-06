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
        private const string ERROR_MAXIMUM_IMAGE = "You can only upload a maximum of 5 images.";
        private const string ERROR_MAXIMUM_IMAGE_SIZE = "Each image must be less than 5 MB.";

        public MaterialService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task<ICollection<MaterialDto>> GetAllMaterialAsync()
        {
            var material = await _unitOfWork.MaterialRepository
                .GetAllAsync(includeProperties: "Images,Brand,Category");
            return _mapper.Map<ICollection<MaterialDto>>(material);
        }

        public async Task<ICollection<MaterialDto>> GetAllMaterialByIdAsync(Guid id)
        {
            var material = await _unitOfWork.MaterialRepository
                .GetRangeAsync(m => m.UserID == id.ToString(), includeProperties: "Images,Category,Brand");
            return _mapper.Map<ICollection<MaterialDto>>(material);
        }
        public async Task<MaterialDto> CreateMaterialAsync(MaterialCreateRequestDto requestDto)
        {
            var errors = new Dictionary<string, string[]>();

            if (requestDto.Images != null)
            {
                if (requestDto.Images.Count > 5)
                {
                    errors.Add(
                        nameof(requestDto.Images),
                        new[] { ERROR_MAXIMUM_IMAGE }
                    );
                }

                if (requestDto.Images.Any(i => i.Length > 5 * 1024 * 1024)) // 5 MB
                {
                    errors.Add(
                        nameof(requestDto.Images),
                        new[] { ERROR_MAXIMUM_IMAGE_SIZE }
                    );
                }
                
            }
            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }

            var material = _mapper.Map<Material>(requestDto);
            await _unitOfWork.MaterialRepository.AddAsync(material);

            foreach (var image in requestDto.Images ?? Enumerable.Empty<IFormFile>())
            {
                var imageUpload = new DataAccess.Entities.Application.Image
                {
                    ImageID = Guid.NewGuid(),
                    MaterialID = material.MaterialID,
                    ImageUrl = "",
                };
                await _unitOfWork.ImageRepository.UploadImageAsync(
                    image,
                    "HomeCareDN/Material",
                    imageUpload
                );
            }
            await _unitOfWork.SaveAsync();

            material = await _unitOfWork.MaterialRepository
                .GetAsync(m => m.MaterialID == material.MaterialID, includeProperties: "Category,Brand");
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
                    { "Material", new[] { "MATERIAL_NOT_FOUND" } },
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

            var errors = new Dictionary<string, string[]>();

            if (material == null)
            {
                errors.Add(
                    "ServiceID",
                    new[] { "MATERIAL_NOT_FOUND" }
                );
                throw new CustomValidationException(errors);
            }
            //check ảnh cũ
            var existingCount = material.Images?.Count ?? 0;
            var newCount = requestDto.Images?.Count ?? 0;

            if (existingCount + newCount > 5)
            {
                errors.Add(nameof(requestDto.Images),
                    new[] { ERROR_MAXIMUM_IMAGE });
            }

            //check khi up ảnh mới
            if (requestDto.Images != null)
            {
                if (requestDto.Images.Count > 5)
                {
                    errors.Add(
                        nameof(requestDto.Images),
                        new[] { ERROR_MAXIMUM_IMAGE }
                    );
                }

                if (requestDto.Images.Any(i => i.Length > 5 * 1024 * 1024))
                {
                    errors.Add(
                        nameof(requestDto.Images),
                        new[] { ERROR_MAXIMUM_IMAGE_SIZE }
                   );
                }        
            }

            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }
            material.PatchFrom(requestDto, nameof(requestDto.Images));

            foreach (var image in requestDto.Images ?? Enumerable.Empty<IFormFile>())
            {
                var imageUpload = new DataAccess.Entities.Application.Image
                {
                    ImageID = Guid.NewGuid(),
                    MaterialID = material.MaterialID,
                    ImageUrl = "",
                };
                await _unitOfWork.ImageRepository.UploadImageAsync(
                    image,
                    "HomeCareDN/Material",
                    imageUpload
                );
            }
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
                    { "MaterailID", new[] { "MATERIAL_NOT_FOUND" } },
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

            _unitOfWork.MaterialRepository.Remove(material);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteMaterialImageAsync(Guid materialId, Guid imageId)
        {
            var request = await _unitOfWork.ImageRepository.GetAsync(
                img => img.ImageID == imageId && img.MaterialID == materialId
            );

            if (request == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "MaterialID", new[] { "MATERIAL_NOT_FOUND" } },
                };
                throw new CustomValidationException(errors);
            }

            if (string.IsNullOrEmpty(request.PublicId))
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Image", new[] { "PUBLIC_ID_NOT_FOUND" } },
                };
                throw new CustomValidationException(errors);
            }

            await _unitOfWork.ImageRepository.DeleteImageAsync(request.PublicId);
            await _unitOfWork.SaveAsync();
        }
    }
}
