using AutoMapper;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.DTOs.Application.SearchAndFilter;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Ultitity.Exceptions;
using Ultitity.Extensions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogic.Services
{
    public class MaterialService : IMaterialService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public MaterialService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
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
                        new[] { "You can only upload a maximum of 5 images." }
                    );
                }

                foreach (var image in requestDto.Images)
                {
                    if (image.Length > 5 * 1024 * 1024) // 5 MB
                    {
                        errors.Add(
                            nameof(requestDto.Images),
                            new[] { "Each image must be less than 5 MB." }
                        );
                    }
                }
            }
            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }

            var material = _mapper.Map<Material>(requestDto);

            await _unitOfWork.MaterialRepository.AddAsync(material);
            await _unitOfWork.SaveAsync();
            if (requestDto.Images != null)
            {
                foreach (var image in requestDto.Images)
                {
                    Image imageUpload = new Image
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
            }
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
                    { "Material", new[] { "No material found." } },
                };
                throw new CustomValidationException(errors);
            }

            return _mapper.Map<MaterialDto>(material);
        }

        public async Task<IEnumerable<MaterialDto>> GetAllHardMaterialAsync(
            MaterialGetAllRequestDto requestDto
        )
        {
            var materials = await _unitOfWork.MaterialRepository.GetAllAsync(
                requestDto.FilterOn,
                requestDto.FilterQuery,
                requestDto.SortBy,
                requestDto.IsAscending,
                requestDto.PageNumber,
                requestDto.PageSize,
                includeProperties: "Images,Category"
            );
            if (materials == null || !materials.Any())
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "Material", new[] { "No material found." } },
                };
                throw new CustomValidationException(errors);
            }

            return _mapper.Map<IEnumerable<MaterialDto>>(materials);
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
                errors.Add(
                    "ServiceID",
                    new[] { $"Service request with ID {requestDto.MaterialID} not found." }
                );
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

                foreach (var image in requestDto.Images)
                {
                    if (image.Length > 5 * 1024 * 1024)
                    {
                        if (errors.ContainsKey(nameof(requestDto.Images)))
                        {
                            var messages = errors[nameof(requestDto.Images)].ToList();
                            messages.Add("Each image must be less than 5 MB.");
                            errors[nameof(requestDto.Images)] = messages.ToArray();
                        }
                        else
                        {
                            errors.Add(
                                nameof(requestDto.Images),
                                new[] { "Each image must be less than 5 MB." }
                            );
                        }
                    }
                }
            }

            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }
            material.PatchFrom(requestDto);
            await _unitOfWork.SaveAsync();
            // Delete old images if they exist
            var existingImages = await _unitOfWork.ImageRepository.GetRangeAsync(i =>
                i.MaterialID == material.MaterialID
            );
            if (existingImages != null && existingImages.Any())
            {
                foreach (var image in existingImages)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }
            if (requestDto.Images != null)
            {
                foreach (var image in requestDto.Images)
                {
                    Image imageUpload = new Image
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
            }

            return _mapper.Map<MaterialDto>(material);
        }

        public async Task DeleteMaterialAsync(Guid id)
        {
            var material = await _unitOfWork.MaterialRepository.GetAsync(m => m.MaterialID == id);

            if (material == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "MaterailID", new[] { $"Material with ID {id} not found." } },
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


        public async Task<IEnumerable<SearchResponseDto>> FilterMaterialsAsync(FilterRequestDto requestDto)
        {
            var errors = new Dictionary<string, string[]>();

            if (requestDto.MinUnitPrice.HasValue && requestDto.MinUnitPrice < 0)
            {
                errors.Add(nameof(requestDto.MinUnitPrice), new[] { "MinUnitPrice must be greater than or equal to 0." });
            }

            if (requestDto.MaxUnitPrice.HasValue && requestDto.MaxUnitPrice < 0)
            {
                errors.Add(nameof(requestDto.MaxUnitPrice), new[] { "MaxUnitPrice must be greater than or equal to 0." });
            }

            if (requestDto.MinUnitPrice.HasValue && requestDto.MaxUnitPrice.HasValue &&
                requestDto.MinUnitPrice > requestDto.MaxUnitPrice)
            {
                errors.Add("UnitPrice", new[] { "MinUnitPrice cannot be greater than MaxUnitPrice." });
            }

            if (!string.IsNullOrWhiteSpace(requestDto.CategoryName) && requestDto.CategoryName.Length < 2)
            {
                errors.Add(nameof(requestDto.CategoryName), new[] { "CategoryName must be at least 2 characters long." });
            }

            if (requestDto.Brand.HasValue && !Enum.IsDefined(typeof(Brand), requestDto.Brand.Value))
            {
                errors.Add(nameof(requestDto.Brand), new[] { "Invalid brand value." });
            }

            if (errors.Any())
            {
                throw new CustomValidationException(errors);
            }

            var query = _unitOfWork.MaterialRepository.GetQueryable(includeProperties: "Category,Images");

            if (!string.IsNullOrEmpty(requestDto.CategoryName))
            {
                query = query.Where(m => m.Category.CategoryName == requestDto.CategoryName);
            }

            if (requestDto.Brand.HasValue)
            {
                query = query.Where(m => m.Brand == requestDto.Brand.Value);
            }
            if (requestDto.MinUnitPrice.HasValue)
            {
                query = query.Where(m => m.UnitPrice >= requestDto.MinUnitPrice.Value);
            }

            if (requestDto.MaxUnitPrice.HasValue)
            {
                query = query.Where(m => m.UnitPrice <= requestDto.MaxUnitPrice.Value);
            }

            var materials = await query.ToListAsync();

            if (!materials.Any())
            {
                throw new CustomValidationException(errors);
            }
            return _mapper.Map<IEnumerable<SearchResponseDto>>(materials);
        }
    }
}
