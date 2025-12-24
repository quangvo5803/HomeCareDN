using BusinessLogic.DTOs.Application.EKyc;

namespace BusinessLogic.Services.Interfaces
{
    public interface IEKycService
    {
        Task<string> VerifyAsync(EKycVerifyRequestDto requestDto);
    }
}
