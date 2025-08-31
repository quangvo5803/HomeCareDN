using AutoMapper;
using BusinessLogic.DTOs.Application.Brand;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Ultitity.Exceptions;
using Ultitity.Extensions;

namespace BusinessLogic.Services
{
    public class BrandService : IBrandService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public BrandService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<BrandDto> CreateBrandAsync(BrandCreateRequestDto requestDto)
        {
            var brand = _mapper.Map<Brand>(requestDto);
            await _unitOfWork.BrandRepository.AddAsync(brand);
            if (requestDto.LogoFile != null)
            {
                Image imageUpload = new Image
                {
                    ImageID = Guid.NewGuid(),
                    BrandID = brand.BrandID,
                    ImageUrl = "",
                };
                await _unitOfWork.ImageRepository.UploadImageAsync(
                    requestDto.LogoFile,
                    "HomeCareDN/BrandLogo",
                    imageUpload
                );
                brand.BrandLogoID = imageUpload.ImageID;
            }
            await _unitOfWork.SaveAsync();
            var brandDto = _mapper.Map<BrandDto>(brand);
            return brandDto;
        }

        public async Task DeleteBrandAsync(Guid id)
        {
            var brand = await _unitOfWork.BrandRepository.GetAsync(brand => brand.BrandID == id);
            if (brand == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "BrandID", new[] { "BRAND_NOT_FOUND" } },
                };
                throw new CustomValidationException(errors);
            }
            var image = await _unitOfWork.ImageRepository.GetAsync(image => image.BrandID == id);
            if (image != null)
            {
                await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
            }
            _unitOfWork.BrandRepository.Remove(brand);
            await _unitOfWork.SaveAsync();
        }

        public async Task<ICollection<BrandDto>> GetAllBrands()
        {
            var brands = await _unitOfWork.BrandRepository.GetAllAsync(
                includeProperties: "LogoImage,Materials"
            );
            var brandDtos = _mapper.Map<ICollection<BrandDto>>(brands);
            return brandDtos;
        }

        public async Task<BrandDto> GetBrandByID(Guid id)
        {
            var errors = new Dictionary<string, string[]>();
            var brand = await _unitOfWork.BrandRepository.GetAsync(b => b.BrandID == id);
            if (brand == null)
            {
                errors.Add("BrandID", new[] { "BRAND_NOT_FOUND" });
                throw new CustomValidationException(errors);
            }
            var brandDto = _mapper.Map<BrandDto>(brand);
            return brandDto;
        }

        public async Task<BrandDto> UpdateBrandAsync(BrandUpdateRequestDto requestDto)
        {
            var errors = new Dictionary<string, string[]>();
            var brand = await _unitOfWork.BrandRepository.GetAsync(
                b => b.BrandID == requestDto.BrandID,
                includeProperties: "LogoImage,Materials"
            );
            if (brand == null)
            {
                errors.Add("BrandID", new[] { "BRAND_NOT_FOUND" });
                throw new CustomValidationException(errors);
            }
            brand.PatchFrom(requestDto);
            if (requestDto.LogoFile != null)
            {
                var existingImage = await _unitOfWork.ImageRepository.GetAsync(img =>
                    img.BrandID == brand.BrandID
                );
                if (existingImage != null)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(existingImage.PublicId);
                }
                Image imageUpload = new Image
                {
                    ImageID = Guid.NewGuid(),
                    BrandID = brand.BrandID,
                    ImageUrl = "",
                };
                await _unitOfWork.ImageRepository.UploadImageAsync(
                    requestDto.LogoFile,
                    "HomeCareDN/BrandLogo",
                    imageUpload
                );
                brand.BrandLogoID = imageUpload.ImageID;
            }
            await _unitOfWork.SaveAsync();
            var brandDto = _mapper.Map<BrandDto>(brand);
            return brandDto;
        }
    }
}
