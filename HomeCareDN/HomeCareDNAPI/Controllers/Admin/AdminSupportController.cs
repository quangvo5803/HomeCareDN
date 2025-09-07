using BusinessLogic.DTOs.Application.ContactSupport;
using Microsoft.AspNetCore.Mvc;
using System.Text.Encodings.Web;

namespace HomeCareDNAPI.Controllers.Admin
{
    public partial class AdminController : ControllerBase
    {
        [HttpGet("support/list")]
        public async Task<IActionResult> ListContactSupports([FromQuery] bool? isProcessed = null)
        {
            var list = await _facadeService.ContactSupportService.ListAllAsync(isProcessed);
            return Ok(list);
        }

        [HttpPost("support/reply/{id:guid}")]
        public async Task<IActionResult> ReplyContactSupport(Guid id, [FromBody] ContactSupportReplyRequestDto dto)
        {
            var adminName = User.Identity?.Name ?? "Admin";

            // Cập nhật + lấy dto cập nhật (giữ nguyên logic của bạn)
            var updated = await _facadeService.ContactSupportService.ReplyAsync(id, dto, adminName);

            // Lấy chi tiết để có Message khách (cần method GetDetailByIdAsync như trên)
            var detail = await _facadeService.ContactSupportService.GetDetailByIdAsync(id);

            // Gửi Email (template đẹp – nội dung giữ nguyên)
            var subject = $"[Phản hồi hỗ trợ] {updated.Subject}";

            var safeName = HtmlEncoder.Default.Encode(updated.FullName);
            var safeEmail = HtmlEncoder.Default.Encode(updated.Email);
            var safeCustomerMsg = HtmlEncoder.Default.Encode(detail.Message);
            var safeAdminReply = HtmlEncoder.Default.Encode(dto.ReplyContent);
            var safeAdmin = HtmlEncoder.Default.Encode(adminName);

            var htmlMessage =
                $"<table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse: collapse; width: 100%; font-family: sans-serif; background-color: #fff5f0; padding: 20px;\">"
                + $"<tr><td align=\"center\">"
                + $"<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"width: 100%; max-width: 600px; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(255, 140, 0, 0.1);\">"
                + $"<tr><td style=\"padding: 24px 32px;\">"
                + $"<div style=\"text-align: left;\">"
                + $"<img src=\"https://res.cloudinary.com/dl4idg6ey/image/upload/v1749266020/logoh_enlx7y.png\" alt=\"HomeCareDN\" style=\"height: 32px; filter: brightness(0) invert(1);\">"
                + $"</div>"
                + $"</td></tr>" +
                $"    <tr><td style=\"padding:24px 32px 0 32px;\">" +
                $"      <p style=\"font-size:18px;color:#2d2d2d;margin:0 0 6px 0;font-weight:600;\">Chào {safeName}!</p>" +
                $"      <p style=\"font-size:14px;color:#666;margin:0 0 16px 0;\">Email: <strong>{safeEmail}</strong></p>" +
                $"    </td></tr>" +
                $"    <tr><td style=\"padding:0 32px 8px 32px;\">" +
                $"      <div style=\"border-left:4px solid #ff8c00;background:#fff5f0;border-radius:0 8px 8px 0;padding:12px 16px;\">" +
                $"        <div style=\"font-size:13px;color:#ff6600;font-weight:600;margin-bottom:6px;\">Nội dung hỗ trợ</div>" +
                $"        <div style=\"font-size:15px;color:#4a4a4a;line-height:1.6;white-space:pre-wrap;\">{safeCustomerMsg}</div>" +
                $"      </div>" +
                $"    </td></tr>" +

                $"    <tr><td style=\"padding:8px 32px;\"><hr style=\"border:none;border-top:1px solid #eee;margin:16px 0;\"/></td></tr>" +

                $"    <tr><td style=\"padding:0 32px 24px 32px;\">" +
                $"      <div style=\"background:linear-gradient(135deg,#fff5f0 0%,#ffe8d6 100%);border:2px solid #ff8c00;border-radius:12px;padding:16px;\">" +
                $"        <div style=\"font-size:13px;color:#ff6600;font-weight:600;margin-bottom:6px;\">Phản hồi từ HomeCareDN</div>" +
                $"        <div style=\"font-size:15px;color:#2d2d2d;line-height:1.6;white-space:pre-wrap;\">{safeAdminReply}</div>" +
                $"      </div>" +
                $"      <p style=\"font-size:13px;color:#777;margin:16px 0 0 0;\">Nếu cần hỗ trợ thêm, vui lòng trả lời email này.</p>" +
                $"      <p style=\"font-size:14px;color:#333;margin:4px 0 0 0;\"><strong>homecaredn43@gmail.com</strong> – HomeCareDN Support</p>" +
                $"    </td></tr>" +

                $"    <tr><td style=\"padding:16px 32px;background:linear-gradient(135deg,#ff8c00 0%,#ff7700 100%);font-size:12px;color:white;text-align:center;\">" +
                $"      <p style=\"margin:0;opacity:.9;\">📍 Người gửi: HomeCareDN</p>" +
                $"      <p style=\"margin:4px 0 0 0;opacity:.8;\">Khu đô thị FPT City, Ngũ Hành Sơn, Đà Nẵng 550000</p>" +
                $"    </td></tr>" +

                $"  </table>" +
                $"</td></tr></table>";

            _emailQueue.QueueEmail(updated.Email, subject, htmlMessage);

            return Ok(updated);
        }

        [HttpDelete("support/delete/{id:guid}")]
        public async Task<IActionResult> DeleteContactSupport(Guid id)
        {
            await _facadeService.ContactSupportService.DeleteAsync(id);
            return NoContent();
        }
    }
}
