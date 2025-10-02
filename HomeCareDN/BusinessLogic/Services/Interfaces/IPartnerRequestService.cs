using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Partner;

namespace BusinessLogic.Services.Interfaces
{
    public interface IPartnerRequestService
    {
        Task<PagedResultDto<PartnerRequestDto>> GetAllPartnerRequestsAsync(
            QueryParameters parameters
        );
        Task<PartnerRequestDto> GetPartnerRequestByIdAsync(Guid partnerRequestID);
        Task<PartnerRequestDto> CreatePartnerRequestAsync(PartnerRequestCreateRequestDto request);
        Task<PartnerRequestDto> ApprovePartnerRequestAsync(Guid partnerRequestID);
        Task<PartnerRequestDto> RejectPartnerRequestAsync(RejectPartnerRequestDto request);
        Task DeletePartnerRequestAsync(Guid partnerRequestId);
    }
}
