using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Partner;

namespace BusinessLogic.Services.Interfaces
{
    public interface IPartnerService
    {
        Task<PagedResultDto<PartnerDto>> GetAllPartnersAsync(QueryParameters parameters);
        Task<PartnerDto> GetPartnerByIdAsync(Guid partnerId);
        Task<PartnerDto> CreatePartnerAsync(PartnerCreateRequest request);
        Task<PartnerDto> ApprovePartnerAsync(PartnerApproveRequest request);
        Task<PartnerDto> RejectPartnerAsync(PartnerRejectRequest request);
        Task DeletePartnerAsync(Guid partnerId);
        Task ValidateLoginAllowedAsync(string email);
    }
}
