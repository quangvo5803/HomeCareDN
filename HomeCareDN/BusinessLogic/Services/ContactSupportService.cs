using System.Text.Encodings.Web;
using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ContactSupport;
using BusinessLogic.DTOs.Application.Material;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Ultitity.Email.Interface;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ContactSupportService : IContactSupportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEmailQueue _emailQueue;

        private const string ContactSupportIdKey = "ContactSupportId";

        public ContactSupportService(IUnitOfWork unitOfWork, IMapper mapper, IEmailQueue emailQueue)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _emailQueue = emailQueue;
        }

        public async Task<PagedResultDto<ContactSupportDto>> ListAllAsync(
            QueryParameters parameters
        )
        {
            var query = _unitOfWork.ContactSupportRepository.GetQueryable();
            if (parameters.FilterBool != null)
            {
                query = query.Where(s => s.IsProcessed == parameters.FilterBool);
            }
            if (!string.IsNullOrWhiteSpace(parameters.Search))
            {
                var keyword = parameters.Search.Trim().ToLower();
                query = query.Where(s =>
                    s.FullName.ToLower().Contains(keyword)
                    || s.Email.ToLower().Contains(keyword)
                    || s.Subject.ToLower().Contains(keyword)
                );
            }
            var totalCount = await query.CountAsync();

            query = parameters.SortBy?.ToLower() switch
            {
                "isprocess" => query.OrderBy(m => m.IsProcessed),
                "isprocess_desc" => query.OrderByDescending(m => m.IsProcessed),
                "fullname" => query.OrderBy(s => s.FullName),
                "fullname_desc" => query.OrderByDescending(s => s.FullName),
                "random" => query.OrderBy(s => s.Id),
                _ => query.OrderBy(b => b.CreateAt),
            };
            var items = await query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize)
                .ToListAsync();
            return new PagedResultDto<ContactSupportDto>
            {
                Items = _mapper.Map<IEnumerable<ContactSupportDto>>(items),
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<ContactSupportDto> GetByIdAsync(Guid id)
        {
            var entity = await _unitOfWork.ContactSupportRepository.GetAsync(x => x.Id == id);

            if (entity == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ContactSupportIdKey, new[] { $"ContactSupport with ID {id} not found." } },
                };
                throw new CustomValidationException(errors);
            }

            return _mapper.Map<ContactSupportDto>(entity);
        }

        public async Task<ContactSupportDto> CreateAsync(ContactSupportCreateRequestDto dto)
        {
            var entity = _mapper.Map<ContactSupport>(dto);

            await _unitOfWork.ContactSupportRepository.AddAsync(entity);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<ContactSupportDto>(entity);
        }

        public async Task<ContactSupportDto> ReplyAsync(ContactSupportReplyRequestDto dto)
        {
            var customerSupportRequest = await _unitOfWork.ContactSupportRepository.GetAsync(
                x => x.Id == dto.ID,
                asNoTracking: false
            );

            if (customerSupportRequest == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    {
                        ContactSupportIdKey,
                        new[] { $"ContactSupport with ID {dto.ID} not found." }
                    },
                };
                throw new CustomValidationException(errors);
            }

            // Gửi Email (template đẹp – nội dung giữ nguyên)
            var subject = $"[Phản hồi hỗ trợ] {customerSupportRequest.Subject}";

            var safeName = HtmlEncoder.Default.Encode(customerSupportRequest.FullName);
            var safeEmail = HtmlEncoder.Default.Encode(customerSupportRequest.Email);
            var safeCustomerMsg = HtmlEncoder.Default.Encode(customerSupportRequest.Message);
            var safeAdminReply = HtmlEncoder.Default.Encode(dto.ReplyContent);

            var htmlMessage =
                $"<table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse: collapse; width: 100%; font-family: sans-serif; background-color: #fff5f0; padding: 20px;\">"
                + $"<tr><td align=\"center\">"
                + $"<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"width: 100%; max-width: 600px; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(255, 140, 0, 0.1);\">"
                + $"<tr><td style=\"padding: 24px 32px;\">"
                + $"<div style=\"text-align: left;\">"
                + $"<img src=\"https://res.cloudinary.com/dl4idg6ey/image/upload/v1749266020/logoh_enlx7y.png\" alt=\"HomeCareDN\" style=\"height: 32px; filter: brightness(0) invert(1);\">"
                + $"</div>"
                + $"</td></tr>"
                + $"    <tr><td style=\"padding:24px 32px 0 32px;\">"
                + $"      <p style=\"font-size:18px;color:#2d2d2d;margin:0 0 6px 0;font-weight:600;\">Chào {safeName}!</p>"
                + $"      <p style=\"font-size:14px;color:#666;margin:0 0 16px 0;\">Email: <strong>{safeEmail}</strong></p>"
                + $"    </td></tr>"
                + $"    <tr><td style=\"padding:0 32px 8px 32px;\">"
                + $"      <div style=\"border-left:4px solid #ff8c00;background:#fff5f0;border-radius:0 8px 8px 0;padding:12px 16px;\">"
                + $"        <div style=\"font-size:13px;color:#ff6600;font-weight:600;margin-bottom:6px;\">Nội dung hỗ trợ</div>"
                + $"        <div style=\"font-size:15px;color:#4a4a4a;line-height:1.6;white-space:pre-wrap;\">{safeCustomerMsg}</div>"
                + $"      </div>"
                + $"    </td></tr>"
                + $"    <tr><td style=\"padding:8px 32px;\"><hr style=\"border:none;border-top:1px solid #eee;margin:16px 0;\"/></td></tr>"
                + $"    <tr><td style=\"padding:0 32px 24px 32px;\">"
                + $"      <div style=\"background:linear-gradient(135deg,#fff5f0 0%,#ffe8d6 100%);border:2px solid #ff8c00;border-radius:12px;padding:16px;\">"
                + $"        <div style=\"font-size:13px;color:#ff6600;font-weight:600;margin-bottom:6px;\">Phản hồi từ HomeCareDN</div>"
                + $"        <div style=\"font-size:15px;color:#808080;line-height:1.6;white-space:pre-wrap;\">{safeAdminReply}</div>"
                + $"      </div>"
                + $"      <p style=\"font-size:13px;color:#777;margin:16px 0 0 0;\">Nếu cần hỗ trợ thêm, vui lòng trả lời email này.</p>"
                + $"      <p style=\"font-size:14px;color:#333;margin:4px 0 0 0;\"><strong>homecaredn43@gmail.com</strong></p>"
                + $"    </td></tr>"
                + $"    <tr><td style=\"padding:16px 32px;background:linear-gradient(135deg,#ff8c00 0%,#ff7700 100%);font-size:12px;color:white;text-align:center;\">"
                + $"      <p style=\"margin:0;opacity:.9;\">📍 Người gửi: HomeCareDN</p>"
                + $"      <p style=\"margin:4px 0 0 0;opacity:.8;\">Khu đô thị FPT City, Ngũ Hành Sơn, Đà Nẵng 550000</p>"
                + $"    </td></tr>"
                + $"  </table>"
                + $"</td></tr></table>";

            _emailQueue.QueueEmail(customerSupportRequest.Email, subject, htmlMessage);
            customerSupportRequest.ReplyContent = dto.ReplyContent;
            customerSupportRequest.ReplyBy = "Admin";
            customerSupportRequest.IsProcessed = true;

            await _unitOfWork.SaveAsync();

            return _mapper.Map<ContactSupportDto>(customerSupportRequest);
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await _unitOfWork.ContactSupportRepository.GetAsync(
                x => x.Id == id,
                asNoTracking: false
            );

            if (entity == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ContactSupportIdKey, new[] { $"ContactSupport with ID {id} not found." } },
                };
                throw new CustomValidationException(errors);
            }

            _unitOfWork.ContactSupportRepository.Remove(entity);
            await _unitOfWork.SaveAsync();
        }
    }
}
