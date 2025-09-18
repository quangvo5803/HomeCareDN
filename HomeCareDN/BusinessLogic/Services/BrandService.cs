using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Brand;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;
using Ultitity.Extensions;

namespace BusinessLogic.Services
{
    public class BrandService : IBrandService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private const string ERROR_MAXIMUM_IMAGE_SIZE = "MAXIMUM_IMAGE_SIZE";

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
                var errors = new Dictionary<string, string[]>();
                if (requestDto.LogoFile.Length > 5 * 1024 * 1024)
                {
                    errors.Add("LogoFile", new[] { ERROR_MAXIMUM_IMAGE_SIZE });
                    throw new CustomValidationException(errors);
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

        public async Task<PagedResultDto<BrandDto>> GetAllBrands(QueryParameters parameters)
        {
            var query = _unitOfWork.BrandRepository.GetQueryable(
                includeProperties: "LogoImage,Materials"
            );
            var totalCount = await query.CountAsync();

            if (parameters.SortBy?.ToLower() == "random")
            {
                var random = new Random();
                var skipIndex = random.Next(0, Math.Max(0, totalCount - parameters.PageSize + 1));

                query = query.OrderBy(b => b.BrandID).Skip(skipIndex).Take(parameters.PageSize);
            }
            else
            {
                query = parameters.SortBy?.ToLower() switch
                {
                    "brandname" => query.OrderBy(b => b.BrandName),
                    "brandname_desc" => query.OrderByDescending(b => b.BrandName),
                    "brandnameen" => query.OrderBy(b => b.BrandNameEN),
                    "brandnameen_desc" => query.OrderByDescending(b => b.BrandNameEN),
                    _ => query.OrderBy(b => b.BrandID),
                };
                query = query
                    .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                    .Take(parameters.PageSize);
            }

            var items = await query.ToListAsync();

            var brandDtos = _mapper.Map<IEnumerable<BrandDto>>(items);
            return new PagedResultDto<BrandDto>
            {
                Items = brandDtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
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
            _mapper.Map(requestDto, brand);
            if (requestDto.LogoFile != null)
            {
                if (requestDto.LogoFile.Length > 5 * 1024 * 1024)
                {
                    errors.Add("LogoFile", new[] { ERROR_MAXIMUM_IMAGE_SIZE });
                    throw new CustomValidationException(errors);
                }
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
