using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Partner;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ultitity.Email.Interface;
using Ultitity.Exceptions;
using Ultitity.Extensions;

namespace BusinessLogic.Services
{
    public class PartnerService : IPartnerService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IEmailQueue _emailQueue;

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
        private const string ERROR_PARTNER_PENDING_REVIEW = "PARTNER_PENDING_REVIEW";
        private const string ERROR_PARTNER_REJECTED = "PARTNER_REJECTED";
        private const string ROLE_DISTRIBUTOR = "Distributor";
        private const string ROLE_CONTRACTOR = "Contractor";
        private const string IMAGES = "Images";

        public PartnerService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IEmailQueue emailQueue
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userManager = userManager;
            _roleManager = roleManager;
            _emailQueue = emailQueue;
        }

        public async Task<PartnerDto> CreatePartnerAsync(PartnerCreateRequest request)
        {
            if (!Enum.TryParse<PartnerType>(request.PartnerType, out var type))
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { ERROR_PARTNER_TYPE, new[] { ERROR_INVALID_PARTNER_TYPE } },
                    }
                );
            }
            //========================================================================
            //Check existing partner
            var existingPartner = await _unitOfWork.PartnerRepository.GetAsync(
                p => p.Email == request.Email,
                includeProperties: IMAGES
            );
            if (existingPartner != null)
            {
                if (existingPartner.Status == PartnerStatus.Pending)
                {
                    throw new CustomValidationException(
                        new Dictionary<string, string[]>
                        {
                            { ERROR_STATUS, new[] { ERROR_PARTNER_PENDING_REVIEW } },
                        }
                    );
                }

                if (existingPartner.Status == PartnerStatus.Approved)
                {
                    throw new CustomValidationException(
                        new Dictionary<string, string[]>
                        {
                            { ERROR_EMAIL, new[] { ERROR_EMAIL_EXISTS } },
                        }
                    );
                }

                ApplyReapplyUpdates(existingPartner, request, type);
                await ReplaceImagesAsync(
                    existingPartner,
                    request.ImageUrls,
                    request.ImagePublicIds
                );
                await _unitOfWork.SaveAsync();

                QueueEmailReceived(existingPartner);

                return _mapper.Map<PartnerDto>(existingPartner);
            }
            //==================================================================

            //if new partner, create new
            ValidateImages(request.ImageUrls);
            var partner = _mapper.Map<Partner>(request);
            partner.PartnerID = Guid.NewGuid();
            partner.PartnerType = type;

            await _unitOfWork.PartnerRepository.AddAsync(partner);
            await UploadPartnerImagesAsync(
                partner.PartnerID,
                request.ImageUrls,
                request.ImagePublicIds
            );
            await _unitOfWork.SaveAsync();

            var created = await _unitOfWork.PartnerRepository.GetAsync(
                p => p.PartnerID == partner.PartnerID,
                includeProperties: IMAGES
            );

            QueueEmailReceived(partner);

            return _mapper.Map<PartnerDto>(created);
        }

        public async Task<PagedResultDto<PartnerDto>> GetAllPartnersAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork.PartnerRepository.GetQueryable(includeProperties: IMAGES);
            if (parameters.FilterPartnerStatus.HasValue)
            {
                query = query.Where(p => p.Status == parameters.FilterPartnerStatus.Value);
            }
            if (!string.IsNullOrWhiteSpace(parameters.Search))
            {
                var s = parameters.Search.Trim().ToLower();
                query = query.Where(p =>
                    p.FullName.ToLower().Contains(s)
                    || p.CompanyName.ToLower().Contains(s)
                    || p.Email.ToLower().Contains(s)
                    || p.PhoneNumber.ToLower().Contains(s)
                );
            }
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
                "random" => query.OrderBy(s => s.PartnerID),
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

            var user = await _userManager.FindByEmailAsync(partner.Email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    Email = partner.Email,
                    UserName = partner.Email,
                    FullName = partner.FullName,
                    EmailConfirmed = false,
                };
                await _userManager.CreateAsync(user);
            }

            var role =
                partner.PartnerType == PartnerType.Distributor ? ROLE_DISTRIBUTOR : ROLE_CONTRACTOR;
            if (!await _roleManager.RoleExistsAsync(role))
                await _roleManager.CreateAsync(new IdentityRole(role));
            if (!await _userManager.IsInRoleAsync(user, role))
                await _userManager.AddToRoleAsync(user, role);

            await _unitOfWork.SaveAsync();

            QueueEmailApproved(partner);

            return _mapper.Map<PartnerDto>(partner);
        }

        public async Task<PartnerDto> RejectPartnerAsync(PartnerRejectRequest request)
        {
            var partner = await _unitOfWork.PartnerRepository.GetAsync(
                p => p.PartnerID == request.PartnerID,
                includeProperties: IMAGES
            );

            ValidatePartner(partner);
            ValidatePartnerStatus(partner!, PartnerStatus.Pending);

            partner!.Status = PartnerStatus.Rejected;
            partner.RejectionReason = request.RejectionReason;

            await _unitOfWork.SaveAsync();

            QueueEmailRejected(partner);

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
                var oldImages = partner.Images.ToList();
                foreach (var image in oldImages)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }

            _unitOfWork.PartnerRepository.Remove(partner);
            await _unitOfWork.SaveAsync();
        }

        public async Task ValidateLoginAllowedAsync(string email)
        {
            var partner = await _unitOfWork.PartnerRepository.GetAsync(p => p.Email == email);
            if (partner == null)
                return;

            var errors = new Dictionary<string, string[]>();
            if (partner.Status == PartnerStatus.Pending)
            {
                errors.Add(ERROR_STATUS, new[] { ERROR_PARTNER_PENDING_REVIEW });
                throw new CustomValidationException(errors);
            }
            if (partner.Status == PartnerStatus.Rejected)
            {
                errors.Add(ERROR_STATUS, new[] { ERROR_PARTNER_REJECTED });
                throw new CustomValidationException(errors);
            }
        }

        //====================Helpers====================

        private static void ApplyReapplyUpdates(
            Partner target,
            PartnerCreateRequest req,
            PartnerType type
        )
        {
            target.FullName = req.FullName;
            target.CompanyName = req.CompanyName;
            target.PhoneNumber = req.PhoneNumber;
            target.Description = req.Description;
            target.PartnerType = type;
            target.Status = PartnerStatus.Pending;
            target.RejectionReason = null;
            target.ApprovedUserId = null;
            target.CreatedAt = DateTime.UtcNow;
        }

        private async Task ReplaceImagesAsync(
            Partner partner,
            ICollection<string>? urls,
            ICollection<string>? publicIds
        )
        {
            if (partner.Images?.Any() == true)
            {
                var oldImages = partner.Images.ToList();

                foreach (var image in oldImages)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }

            await UploadPartnerImagesAsync(partner.PartnerID, urls, publicIds);
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

        private static string BuildBaseEmail(
            string title,
            string contentHtml,
            string? highlight = null
        )
        {
            var highlightBlock = string.IsNullOrWhiteSpace(highlight)
                ? ""
                : $"<div style=\"background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%); border: 2px solid #ff8c00; border-radius: 12px; padding: 16px; text-align: center; margin: 16px 0;\">"
                    + $"<p style=\"font-size: 16px; font-weight: 600; color: #ff6600; margin: 0;\">{highlight}</p>"
                    + $"</div>";

            return "<table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse: collapse; width: 100%; font-family: sans-serif; background-color: #fff5f0; padding: 20px;\">"
                + "<tr><td align=\"center\">"
                + "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"width: 100%; max-width: 600px; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(255, 140, 0, 0.1);\">"
                + "<tr><td style=\"padding: 24px 32px;\"><div style=\"text-align: left;\">"
                + "<img src=\"https://res.cloudinary.com/dl4idg6ey/image/upload/v1749266020/logoh_enlx7y.png\" alt=\"HomeCareDN\" style=\"height: 32px; filter: brightness(0) invert(1);\">"
                + "</div></td></tr>"
                + "<tr><td style=\"padding: 28px 32px;\">"
                + $"<p style=\"font-size: 18px; color: #2d2d2d; margin: 0 0 8px 0; font-weight: 700;\">{title}</p>"
                + $"<div style=\"font-size: 15px; color: #4a4a4a; line-height: 1.6;\">{contentHtml}</div>"
                + highlightBlock
                + "<p style=\"font-size: 12px; color: #888; margin-top: 18px;\">Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.</p>"
                + "</td></tr>"
                + "<tr><td style=\"padding: 20px 32px; background: linear-gradient(135deg, #ff8c00 0%, #ff7700 100%); font-size: 12px; color: white; text-align: center;\">"
                + "<p style=\"margin: 0; opacity: 0.9;\">📍 Người gửi: HomeCareDN</p>"
                + "<p style=\"margin: 4px 0 0 0; opacity: 0.8;\">Khu đô thị FPT City, Ngũ Hành Sơn, Đà Nẵng 550000</p>"
                + "</td></tr></table></td></tr></table>";
        }

        private void QueueEmailReceived(Partner p)
        {
            var title = "HomeCareDN: Đã nhận hồ sơ đối tác của bạn";
            var body =
                $"<p>Chào <b>{p.CompanyName}</b>,</p>"
                + "<p>Chúng tôi đã nhận được hồ sơ đăng ký đối tác của bạn và sẽ xem xét trong thời gian sớm nhất.</p>"
                + $"<p><b>Loại hình:</b> {p.PartnerType.GetDisplayName()}<br>"
                + $"<b>Email:</b> {p.Email}<br>"
                + $"<b>Số điện thoại:</b> {p.PhoneNumber}</p>"
                + "<p>Bạn sẽ nhận được email khi hồ sơ được phê duyệt hoặc bị từ chối.</p>";
            _emailQueue.QueueEmail(p.Email, title, BuildBaseEmail(title, body));
        }

        private void QueueEmailApproved(Partner p)
        {
            var title = "HomeCareDN: Hồ sơ đối tác đã được phê duyệt";
            var body =
                $"<p>Chúc mừng <b>{p.CompanyName}</b>!</p>"
                + "<p>Hồ sơ đối tác của bạn đã được phê duyệt. Tài khoản truy cập hệ thống đã được tạo bằng chính địa chỉ email này.</p>"
                + "<p><b>Cách đăng nhập:</b> Trên màn hình đăng nhập, chọn <i>Gửi mã OTP</i> tới email này, sau đó nhập mã để đăng nhập.</p>"
                + $"<p><b>Loại hình:</b> {p.PartnerType.GetDisplayName()}</p>";
            var highlight = "Bạn có thể đăng nhập ngay bằng OTP.";
            _emailQueue.QueueEmail(p.Email, title, BuildBaseEmail(title, body, highlight));
        }

        private void QueueEmailRejected(Partner p)
        {
            var title = "HomeCareDN: Hồ sơ đối tác chưa được phê duyệt";
            var reason = string.IsNullOrWhiteSpace(p.RejectionReason)
                ? "Không có lý do cụ thể."
                : p.RejectionReason!;
            var body =
                $"<p>Chào <b>{p.CompanyName}</b>,</p>"
                + "<p>Rất tiếc, hồ sơ đăng ký đối tác của bạn chưa thể được phê duyệt vào thời điểm này.</p>"
                + $"<p><b>Lý do:</b> {reason}</p>"
                + "<p>Nếu cần bổ sung thông tin, vui lòng phản hồi email này để chúng tôi hỗ trợ.</p>";
            _emailQueue.QueueEmail(p.Email, title, BuildBaseEmail(title, body));
        }
    }
}
