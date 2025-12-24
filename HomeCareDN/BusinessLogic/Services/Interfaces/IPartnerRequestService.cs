using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.PartnerRequest;

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
        Task SendPartnerOtpAsync(SendPartnerOtpRequestDto request);
        Task<string> VerifyPartnerOtpAsync(VerifyPartnerOtpRequestDto request);
        Task DeletePartnerRequestAsync(Guid partnerRequestId);
        Task<string> UpdateSignaturePartnerRequestAsync(
            PartnerRequestUpdateSignatureRequestDto request
        );
    }
}
