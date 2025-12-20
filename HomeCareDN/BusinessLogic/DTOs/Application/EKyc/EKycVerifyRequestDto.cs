using Microsoft.AspNetCore.Http;

namespace BusinessLogic.DTOs.Application.EKyc
{
    public class EKycVerifyRequestDto
    {
        public IFormFile CccdImage { get; set; } = default!;
        public IFormFile FaceVideo { get; set; } = default!;
    }
}
