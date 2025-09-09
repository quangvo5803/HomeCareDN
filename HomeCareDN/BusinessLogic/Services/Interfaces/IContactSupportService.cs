using BusinessLogic.DTOs.Application.ContactSupport;

namespace BusinessLogic.Services.Interfaces
{
    public interface IContactSupportService
    {
        Task<ICollection<ContactSupportDto>> ListAllAsync(bool? isProcessed = null);
        Task<ContactSupportDto> GetByIdAsync(Guid id);
        Task<ContactSupportDto> CreateAsync(ContactSupportCreateRequestDto dto);
        Task<ContactSupportDto> ReplyAsync( ContactSupportReplyRequestDto dto);
        Task DeleteAsync(Guid id);
    }
}
