using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Partner;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;
using Ultitity.Extensions;

namespace BusinessLogic.Services
{
    public class PartnerService : IPartnerService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        private const string ERROR_PARTNER = "PARTNER";
        private const string ERROR_STATUS = "STATUS";
        private const string ERROR_EMAIL = "EMAIL";
        private const string ERROR_PARTNER_TYPE = "PARTNERTYPE";
        private const string ERROR_PARTNER_NOT_FOUND = "PARTNER_NOT_FOUND";
        private const string ERROR_EMAIL_EXISTS = "EMAIL_ALREADY_EXISTS";
        private const string ERROR_INVALID_PARTNER_TYPE = "INVALID_PARTNER_TYPE";
        private const string ERROR_MAXIMUM_IMAGE = "MAXIMUM_IMAGE";
        private const string ERROR_MAXIMUM_IMAGE_SIZE = "MAXIMUM_IMAGE_SIZE";
        private const string ERROR_PARTNER_NOT_PENDING = "PARTNER_NOT_PENDING";
        private const string IMAGES = "Images";

        public PartnerService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PartnerDto> CreatePartnerAsync(PartnerCreateRequest request)
        {
            var errors = new Dictionary<string, string[]>();

            var existingPartner = await _unitOfWork.PartnerRepository.GetAsync(p =>
                p.Email == request.Email
            );

            if (existingPartner != null)
            {
                errors.Add(ERROR_EMAIL, new[] { ERROR_EMAIL_EXISTS });
                throw new CustomValidationException(errors);
            }

            if (!Enum.TryParse<PartnerType>(request.PartnerType, out _))
            {
                errors.Add(ERROR_PARTNER_TYPE, new[] { ERROR_INVALID_PARTNER_TYPE });
                throw new CustomValidationException(errors);
            }

            ValidateImages(request.ImageUrls);

            var partner = _mapper.Map<Partner>(request);
            partner.PartnerID = Guid.NewGuid();

            await _unitOfWork.PartnerRepository.AddAsync(partner);

            await UploadPartnerImagesAsync(
                partner.PartnerID,
                request.ImageUrls,
                request.ImagePublicIds
            );

            await _unitOfWork.SaveAsync();

            var createdPartner = await _unitOfWork.PartnerRepository.GetAsync(
                p => p.PartnerID == partner.PartnerID,
                includeProperties: IMAGES
            );

            return _mapper.Map<PartnerDto>(createdPartner);
        }

        public async Task<PagedResultDto<PartnerDto>> GetAllPartnersAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork.PartnerRepository.GetQueryable(includeProperties: IMAGES);
            var totalCount = await query.CountAsync();

            query = parameters.SortBy?.ToLower() switch
            {
                "companyname" => query.OrderBy(p => p.CompanyName),
                "companyname_desc" => query.OrderByDescending(p => p.CompanyName),
                "email" => query.OrderBy(p => p.Email),
                "email_desc" => query.OrderByDescending(p => p.Email),
                "status" => query.OrderBy(p => p.Status),
                "status_desc" => query.OrderByDescending(p => p.Status),
                "partnertype" => query.OrderBy(p => p.PartnerType),
                "partnertype_desc" => query.OrderByDescending(p => p.PartnerType),
                "createdat" => query.OrderBy(p => p.CreatedAt),
                "createdat_desc" => query.OrderByDescending(p => p.CreatedAt),
                "random" => query.OrderBy(p => Guid.NewGuid()),
                _ => query.OrderByDescending(p => p.CreatedAt),
            };

            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

            var partners = await query.ToListAsync();

            var partnerDtos = _mapper.Map<IEnumerable<PartnerDto>>(partners);

            return new PagedResultDto<PartnerDto>
            {
                Items = partnerDtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<PartnerDto> GetPartnerByIdAsync(Guid partnerId)
        {
            var partner = await _unitOfWork.PartnerRepository.GetAsync(
                p => p.PartnerID == partnerId,
                includeProperties: IMAGES
            );

            ValidatePartner(partner);

            return _mapper.Map<PartnerDto>(partner);
        }

        public async Task<PartnerDto> ApprovePartnerAsync(PartnerApproveRequest request)
        {
            var partner = await _unitOfWork.PartnerRepository.GetAsync(
                p => p.PartnerID == request.PartnerID,
                includeProperties: IMAGES
            );

            ValidatePartner(partner);
            ValidatePartnerStatus(partner!, PartnerStatus.Pending);

            partner!.Status = PartnerStatus.Approved;
            partner.ApprovedUserId = request.ApprovedUserId;

            await _unitOfWork.SaveAsync();

            return _mapper.Map<PartnerDto>(partner);
        }

        public async Task<PartnerDto> RejectPartnerAsync(PartnerRejectRequest requestRejectRequest)
        {
            var partner = await _unitOfWork.PartnerRepository.GetAsync(
                p => p.PartnerID == requestRejectRequest.PartnerID,
                includeProperties: IMAGES
            );

            ValidatePartner(partner);
            ValidatePartnerStatus(partner!, PartnerStatus.Pending);

            partner!.Status = PartnerStatus.Rejected;
            partner.RejectionReason = requestRejectRequest.RejectionReason;

            await _unitOfWork.SaveAsync();

            return _mapper.Map<PartnerDto>(partner);
        }

        public async Task DeletePartnerAsync(Guid partnerId)
        {
            var partner = await _unitOfWork.PartnerRepository.GetAsync(p =>
                p.PartnerID == partnerId
            );

            ValidatePartner(partner);

            if (partner!.Images?.Any() == true)
            {
                foreach (var image in partner.Images)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }

            _unitOfWork.PartnerRepository.Remove(partner);
            await _unitOfWork.SaveAsync();
        }

        private async Task UploadPartnerImagesAsync(
            Guid partnerId,
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
                            PartnerID = partnerId,
                            ImageUrl = url,
                            PublicId = i < ids.Count ? ids[i] : string.Empty,
                        }
                )
                .ToList();

            await _unitOfWork.ImageRepository.AddRangeAsync(images);
        }

        private static void ValidatePartner(Partner? partner)
        {
            if (partner == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ERROR_PARTNER, new[] { ERROR_PARTNER_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
        }

        private static void ValidatePartnerStatus(Partner partner, PartnerStatus expectedStatus)
        {
            if (partner.Status != expectedStatus)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ERROR_STATUS, new[] { ERROR_PARTNER_NOT_PENDING } },
                };
                throw new CustomValidationException(errors);
            }
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
    }
}
