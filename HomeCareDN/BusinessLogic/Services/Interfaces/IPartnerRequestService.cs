using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Partner;

namespace BusinessLogic.Services.Interfaces
{
    public interface IPartnerRequestService
    {
        Task<PagedResultDto<PartnerRequestDto>> GetAllPartnersAsync(QueryParameters parameters);
        Task<PartnerRequestDto> GetPartnerByIdAsync(Guid partnerId);
        Task<PartnerRequestDto> CreatePartnerAsync(PartnerRequestCreateRequestDto request);
        Task<PartnerRequestDto> ApprovePartnerAsync(ApprovePartnerRequestDto request);
        Task<PartnerRequestDto> RejectPartnerAsync(RejectPartnerRequestDto request);
        Task DeletePartnerAsync(Guid partnerId);
        Task ValidateLoginAllowedAsync(string email);
    }
}
