using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ContactSupport;

namespace BusinessLogic.Services.Interfaces
{
    public interface IContactSupportService
    {
        Task<PagedResultDto<ContactSupportDto>> ListAllAsync(QueryParameters parameters);
        Task<ContactSupportDto> GetByIdAsync(Guid id);
        Task<ContactSupportDto> CreateAsync(ContactSupportCreateRequestDto dto);
        Task<ContactSupportDto> ReplyAsync(ContactSupportReplyRequestDto dto);
        Task DeleteAsync(Guid id);
    }
}
