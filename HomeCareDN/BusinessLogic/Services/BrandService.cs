using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Brand;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

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

        public async Task<PagedResultDto<BrandDto>> GetAllBrands(QueryParameters parameters)
        {
            var query = _unitOfWork.BrandRepository.GetQueryable(
                includeProperties: "LogoImage,Materials"
            );
            if (!string.IsNullOrEmpty(parameters.Search))
            {
                string searchLower = parameters.Search.ToLower();
                query = query.Where(b =>
                    b.BrandName.ToLower().Contains(searchLower)
                    || (
                        !string.IsNullOrEmpty(b.BrandDescription)
                        && b.BrandDescription.ToLower().Contains(searchLower)
                    )
                    || (
                        !string.IsNullOrEmpty(b.BrandNameEN)
                        && b.BrandNameEN.ToLower().Contains(searchLower)
                    )
                    || (
                        !string.IsNullOrEmpty(b.BrandDescriptionEN)
                        && b.BrandDescriptionEN.ToLower().Contains(searchLower)
                    )
                );
            }
            var totalCount = await query.CountAsync();

            query = parameters.SortBy switch
            {
                "brandname" => query.OrderBy(b => b.BrandName),
                "brandname_desc" => query.OrderByDescending(b => b.BrandName),
                "brandnameen" => query.OrderBy(b => b.BrandNameEN ?? b.BrandName),
                "brandnameen_desc" => query.OrderByDescending(b => b.BrandNameEN ?? b.BrandName),
                "materialcount" => query.OrderBy(b => (int?)b.Materials!.Count ?? 0),
                "materialcount_desc" => query.OrderByDescending(b => (int?)b.Materials!.Count ?? 0),
                "random" => query.OrderBy(b => b.BrandID),
                _ => query.OrderBy(b => b.CreatedAt),
            };
            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

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

        public async Task<BrandDto> CreateBrandAsync(BrandCreateRequestDto requestDto)
        {
            var brand = _mapper.Map<Brand>(requestDto);
            brand.BrandID = Guid.NewGuid();

            Image imageUpload = new Image
            {
                ImageID = Guid.NewGuid(),
                BrandID = brand.BrandID,
                ImageUrl = requestDto.BrandLogoUrl,
                PublicId = requestDto.BrandLogoPublicId,
            };
            brand.BrandLogoID = imageUpload.ImageID;

            await _unitOfWork.ImageRepository.AddAsync(imageUpload);
            await _unitOfWork.BrandRepository.AddAsync(brand);

            await _unitOfWork.SaveAsync();

            var brandDto = _mapper.Map<BrandDto>(brand);
            return brandDto;
        }

        public async Task<BrandDto> UpdateBrandAsync(BrandUpdateRequestDto requestDto)
        {
            var errors = new Dictionary<string, string[]>();
            var brand = await _unitOfWork.BrandRepository.GetAsync(
                b => b.BrandID == requestDto.BrandID,
                includeProperties: "LogoImage,Materials",
                false
            );

            if (brand == null)
            {
                errors.Add("BrandID", new[] { "BRAND_NOT_FOUND" });
                throw new CustomValidationException(errors);
            }

            _mapper.Map(requestDto, brand);

            if (
                !string.IsNullOrEmpty(requestDto.BrandLogoUrl)
                && !string.IsNullOrEmpty(requestDto.BrandLogoPublicId)
            )
            {
                if (brand.BrandLogoID.HasValue)
                {
                    var oldImage = await _unitOfWork.ImageRepository.GetAsync(i =>
                        i.ImageID == brand.BrandLogoID.Value
                    );
                    if (oldImage != null)
                    {
                        await _unitOfWork.ImageRepository.DeleteImageAsync(oldImage.PublicId);
                    }
                }
                var imageUpload = new Image
                {
                    ImageID = Guid.NewGuid(),
                    BrandID = brand.BrandID,
                    ImageUrl = requestDto.BrandLogoUrl,
                    PublicId = requestDto.BrandLogoPublicId,
                };

                await _unitOfWork.ImageRepository.AddAsync(imageUpload);
                brand.BrandLogoID = imageUpload.ImageID;
            }

            await _unitOfWork.SaveAsync();

            return _mapper.Map<BrandDto>(brand);
        }

        public async Task DeleteBrandAsync(Guid id)
        {
            var brand = await _unitOfWork.BrandRepository.GetAsync(
                brand => brand.BrandID == id,
                asNoTracking: false
            );
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

        public async Task<bool> CheckBrandExisiting(string brandName, Guid? brandId = null)
        {
            var exisiting = await _unitOfWork.BrandRepository.GetAsync(b =>
                (!brandId.HasValue || b.BrandID != brandId.Value)
                && (b.BrandName == brandName || b.BrandNameEN == brandName)
            );
            return exisiting != null;
        }
    }
}
