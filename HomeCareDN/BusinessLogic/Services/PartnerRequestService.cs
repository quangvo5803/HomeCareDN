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
    public class PartnerRequestService : IPartnerRequestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailQueue _emailQueue;

        private const string PARTNER_REQUEST = "PartnerRequest";
        private const string ERROR_PARTNER_REQUEST_NOT_FOUND = "PARTNER_REQUEST_NOT_FOUND";
        private const string ERROR_PARTNER_REQUEST_PENDING = "PARTNER_REQUEST_PENDING";
        private const string ERROR_PARTNER_REQUEST_REJECTED = "PARTNER_REQUEST_REJECTED";
        private const string PARTNER_REQUEST_INCLUDES = "Images,Documents";

        public PartnerRequestService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            UserManager<ApplicationUser> userManager,
            IEmailQueue emailQueue
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userManager = userManager;
            _emailQueue = emailQueue;
        }

        public async Task<PagedResultDto<PartnerRequestDto>> GetAllPartnerRequestsAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork.PartnerRequestRepository.GetQueryable(
                includeProperties: PARTNER_REQUEST_INCLUDES
            );
            if (parameters.FilterPartnerRequestStatus.HasValue)
            {
                query = query.Where(p => p.Status == parameters.FilterPartnerRequestStatus.Value);
            }

            if (parameters.Search != null)
            {
                var searchLower = parameters.Search.ToLower();
                query = query.Where(p =>
                    p.CompanyName.ToLower().Contains(searchLower)
                    || p.Email.ToLower().Contains(searchLower)
                    || p.PhoneNumber.Contains(searchLower)
                );
            }
            var totalCount = await query.CountAsync();

            query = parameters.SortBy?.ToLower() switch
            {
                "companyname" => query.OrderBy(p => p.CompanyName),
                "companynamedesc" => query.OrderByDescending(p => p.CompanyName),
                "createddate" => query.OrderBy(p => p.CreatedAt),
                "createddatedesc" => query.OrderByDescending(p => p.CreatedAt),
                "random" => query.OrderBy(p => p.PartnerRequestID),
                _ => query.OrderBy(p => p.CreatedAt),
            };
            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

            var items = await query.ToListAsync();
            var dtos = _mapper.Map<IEnumerable<PartnerRequestDto>>(items);
            return new PagedResultDto<PartnerRequestDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<PartnerRequestDto> GetPartnerRequestByIdAsync(Guid partnerRequestID)
        {
            var partnerRequest = await _unitOfWork.PartnerRequestRepository.GetAsync(
                m => m.PartnerRequestID == partnerRequestID,
                includeProperties: PARTNER_REQUEST_INCLUDES,
                false
            );

            if (partnerRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { PARTNER_REQUEST, new[] { ERROR_PARTNER_REQUEST_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            return _mapper.Map<PartnerRequestDto>(partnerRequest);
        }

        public async Task<PartnerRequestDto> CreatePartnerRequestAsync(
            PartnerRequestCreateRequestDto request
        )
        {
            try
            {
                await ValidatePartnerRequestAsync(request);

                var partnerRequest = _mapper.Map<PartnerRequest>(request);
                await _unitOfWork.PartnerRequestRepository.AddAsync(partnerRequest);

                await ProcessPartnerImagesAsync(request, partnerRequest.PartnerRequestID);
                await ProcessPartnerDocumentsAsync(request, partnerRequest.PartnerRequestID);

                await _unitOfWork.SaveAsync();
                QueueEmailReceived(partnerRequest);

                return _mapper.Map<PartnerRequestDto>(partnerRequest);
            }
            catch (Exception)
            {
                await HandleImageError(request.ImagePublicIds);
                throw;
            }
        }

        public async Task<PartnerRequestDto> ApprovePartnerRequestAsync(Guid partnerRequestID)
        {
            var partnerRequest = await _unitOfWork.PartnerRequestRepository.GetAsync(
                m => m.PartnerRequestID == partnerRequestID,
                includeProperties: PARTNER_REQUEST_INCLUDES,
                false
            );

            if (partnerRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { PARTNER_REQUEST, new[] { ERROR_PARTNER_REQUEST_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            partnerRequest.Status = PartneRequestrStatus.Approved;

            var user = new ApplicationUser
            {
                Email = partnerRequest.Email,
                UserName = partnerRequest.Email,
                FullName = partnerRequest.CompanyName,
                PhoneNumber = partnerRequest.PhoneNumber,
            };
            await _userManager.CreateAsync(user);
            await _userManager.AddToRoleAsync(
                user,
                partnerRequest.PartnerRequestType.GetDisplayName()
            );
            await _unitOfWork.SaveAsync();
            QueueEmailApproved(partnerRequest);
            var partnerRequestDto = _mapper.Map<PartnerRequestDto>(partnerRequest);
            return partnerRequestDto;
        }

        public async Task<PartnerRequestDto> RejectPartnerRequestAsync(
            RejectPartnerRequestDto request
        )
        {
            var partnerRequest = await _unitOfWork.PartnerRequestRepository.GetAsync(
                m => m.PartnerRequestID == request.PartnerRequestID,
                includeProperties: PARTNER_REQUEST_INCLUDES,
                false
            );

            if (partnerRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { PARTNER_REQUEST, new[] { ERROR_PARTNER_REQUEST_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            partnerRequest.Status = PartneRequestrStatus.Rejected;
            partnerRequest.RejectionReason = request.RejectionReason;
            await _unitOfWork.SaveAsync();
            QueueEmailRejected(partnerRequest);
            var partnerRequestDto = _mapper.Map<PartnerRequestDto>(partnerRequest);
            return partnerRequestDto;
        }

        public async Task DeletePartnerRequestAsync(Guid partnerRequestId)
        {
            var partnerRequest = await _unitOfWork.PartnerRequestRepository.GetAsync(
                m => m.PartnerRequestID == partnerRequestId,
                includeProperties: PARTNER_REQUEST_INCLUDES
            );

            if (partnerRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { PARTNER_REQUEST, new[] { ERROR_PARTNER_REQUEST_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            var images = await _unitOfWork.ImageRepository.GetRangeAsync(i =>
                i.PartnerRequestID == partnerRequestId
            );
            var documents = await _unitOfWork.DocumentRepository.GetRangeAsync(i =>
                i.PartnerRequestID == partnerRequestId
            );
            if (images != null && images.Any())
            {
                foreach (var image in images)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }
            if (documents != null && documents.Any())
            {
                foreach (var document in documents)
                {
                    await _unitOfWork.DocumentRepository.DeleteDocumentAsync(document.PublicId);
                }
            }

            _unitOfWork.PartnerRequestRepository.Remove(partnerRequest);
            await _unitOfWork.SaveAsync();
        }

        private async Task ValidatePartnerRequestAsync(PartnerRequestCreateRequestDto request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user != null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { PARTNER_REQUEST, new[] { "REGISTER_ALREADY_EXISTS" } },
                    }
                );
            }

            var existing = (
                await _unitOfWork.PartnerRequestRepository.GetAllAsync()
            ).FirstOrDefault(p => p.Email == request.Email);

            if (existing != null)
            {
                switch (existing.Status)
                {
                    case PartneRequestrStatus.Pending:
                        throw new CustomValidationException(
                            new Dictionary<string, string[]>
                            {
                                { PARTNER_REQUEST, new[] { ERROR_PARTNER_REQUEST_PENDING } },
                            }
                        );
                    case PartneRequestrStatus.Rejected:
                        if (existing.CreatedAt.AddDays(3) > DateTime.UtcNow)
                        {
                            throw new CustomValidationException(
                                new Dictionary<string, string[]>
                                {
                                    { PARTNER_REQUEST, new[] { ERROR_PARTNER_REQUEST_REJECTED } },
                                }
                            );
                        }
                        break;
                }
            }
        }

        private async Task ProcessPartnerImagesAsync(
            PartnerRequestCreateRequestDto request,
            Guid partnerRequestId
        )
        {
            if (request.ImageUrls == null || !request.ImageUrls.Any())
            {
                return;
            }

            var ids = request.ImagePublicIds?.ToList() ?? new List<string>();
            var images = request
                .ImageUrls.Select(
                    (url, i) =>
                        new Image
                        {
                            ImageID = Guid.NewGuid(),
                            PartnerRequestID = partnerRequestId,
                            ImageUrl = url,
                            PublicId = i < ids.Count ? ids[i] : string.Empty,
                        }
                )
                .ToList();

            await _unitOfWork.ImageRepository.AddRangeAsync(images);
        }

        private async Task ProcessPartnerDocumentsAsync(
            PartnerRequestCreateRequestDto request,
            Guid partnerRequestId
        )
        {
            if (request.DocumentUrls == null || !request.DocumentUrls.Any())
            {
                return;
            }

            var ids = request.DocumentPublicIds?.ToList() ?? new List<string>();
            var documents = request
                .DocumentUrls.Select(
                    (url, i) =>
                        new Document
                        {
                            DocumentID = Guid.NewGuid(),
                            PartnerRequestID = partnerRequestId,
                            DocumentUrl = url,
                            PublicId = i < ids.Count ? ids[i] : string.Empty,
                        }
                )
                .ToList();

            await _unitOfWork.DocumentRepository.AddRangeAsync(documents);
        }

        #region EmailTemplate
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

        private void QueueEmailReceived(PartnerRequest p)
        {
            var title = "HomeCareDN: Đã nhận hồ sơ đối tác của bạn";
            var body =
                $"<p>Chào <b>{p.CompanyName}</b>,</p>"
                + "<p>Chúng tôi đã nhận được hồ sơ đăng ký đối tác của bạn và sẽ xem xét trong thời gian sớm nhất.</p>"
                + $"<p><b>Loại hình:</b> {p.PartnerRequestType.GetDisplayName()}<br>"
                + $"<b>Email:</b> {p.Email}<br>"
                + $"<b>Số điện thoại:</b> {p.PhoneNumber}</p>"
                + "<p>Bạn sẽ nhận được email khi hồ sơ được phê duyệt hoặc bị từ chối.</p>";
            _emailQueue.QueueEmail(p.Email, title, BuildBaseEmail(title, body));
        }

        private void QueueEmailApproved(PartnerRequest p)
        {
            var title = "HomeCareDN: Hồ sơ đối tác đã được phê duyệt";
            var body =
                $"<p>Chúc mừng <b>{p.CompanyName}</b>!</p>"
                + "<p>Hồ sơ đối tác của bạn đã được phê duyệt. Tài khoản truy cập hệ thống đã được tạo bằng chính địa chỉ email này.</p>"
                + "<p><b>Cách đăng nhập:</b> Trên màn hình đăng nhập, chọn <i>Gửi mã OTP</i> tới email này, sau đó nhập mã để đăng nhập.</p>"
                + $"<p><b>Loại hình:</b> {p.PartnerRequestType.GetDisplayName()}</p>";
            var highlight = "Bạn có thể đăng nhập ngay bằng OTP.";
            _emailQueue.QueueEmail(p.Email, title, BuildBaseEmail(title, body, highlight));
        }

        private void QueueEmailRejected(PartnerRequest p)
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
        #endregion

        private async Task HandleImageError(ICollection<string> publicIds)
        {
            if (publicIds.Count > 0)
            {
                foreach (var publicId in publicIds)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(publicId);
                }
            }
        }
    }
}
