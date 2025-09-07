using BusinessLogic.DTOs.Application.ContactSupport;

namespace BusinessLogic.Services.Interfaces
{
    public interface IContactSupportService
    {
        Task<ICollection<ContactSupportDto>> ListAllAsync(bool? isProcessed = null);
        Task<ContactSupportDto> GetByIdAsync(Guid id);
        Task<ContactSupportDto> CreateAsync(ContactSupportCreateRequestDto dto);
        Task<ContactSupportDto> ReplyAsync(Guid id, ContactSupportReplyRequestDto dto, string adminName);
        Task<ContactSupportDetailDto> GetDetailByIdAsync(Guid id);
        Task DeleteAsync(Guid id);
    }
}
