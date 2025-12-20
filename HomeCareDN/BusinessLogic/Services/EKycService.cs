using System.Globalization;
using System.Text.Json;
using BusinessLogic.DTOs.Application.EKyc;
using BusinessLogic.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json.Linq;
using Ultitity.Clients.FptAI;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class EKycService : IEKycService
    {
        private readonly IFptAiClient _fptAiClient;
        private readonly IMemoryCache _cache;
        private const int EKYC_EXPIRE_MINUTES = 10;
        

        private const string EKYC_LIVENESS_NA = "EKYC_LIVENESS_NA";
        private const string EKYC_LIVENESS_FAIL = "EKYC_LIVENESS_FAIL";
        private const string EKYC_FACE_MATCH_NA = "EKYC_FACE_MATCH_NA";

        private const string EKYC_MISSING_INPUT = "EKYC_MISSING_INPUT";
        private const string EKYC_VIDEO_QUALITY_LOW = "EKYC_VIDEO_QUALITY_LOW";
        private const string EKYC_LIVENESS_FAILED = "EKYC_LIVENESS_FAILED";
        private const string EKYC_FACE_NOT_DETECTED ="EKYC_FACE_NOT_DETECTED";
        private const string EKYC_FACE_MATCH_INVALID = "EKYC_FACE_MATCH_INVALID";
        private const string EKYC_FACE_NOT_MATCH = "EKYC_FACE_NOT_MATCH";

        public EKycService(IFptAiClient fptAiClient, IMemoryCache cache)
        {
            _fptAiClient = fptAiClient;
            _cache = cache;
        }

        public async Task<string> VerifyAsync(EKycVerifyRequestDto requestDto)
        {
            if (requestDto.CccdImage == null || requestDto.FaceVideo == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_MISSING_INPUT, new[] { EKYC_MISSING_INPUT } },
                    }
                );
            }

            var ocrResult = await _fptAiClient.OcrCccdAsync(requestDto.CccdImage);

            var resultJson = await _fptAiClient.LivenessWithFaceMatchAsync(
                requestDto.CccdImage,
                requestDto.FaceVideo
            );

            var json = JsonDocument.Parse(resultJson);
            var liveness = json.RootElement.GetProperty("liveness");

            bool isLive = liveness.GetProperty("is_live").GetString() == "true";
            var spoofStr = liveness.GetProperty("spoof_prob").GetString();

            if (
                spoofStr == "N/A"
                || !double.TryParse(
                    spoofStr,
                    NumberStyles.Any,
                    CultureInfo.InvariantCulture,
                    out double spoofProb
                )
            )
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_LIVENESS_NA, new[] { EKYC_VIDEO_QUALITY_LOW } },
                    }
                );
            }

            if (!isLive || spoofProb > 0.5)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_LIVENESS_FAIL, new[] { EKYC_LIVENESS_FAILED } },
                    }
                );
            }

            var faceMatch = json.RootElement.GetProperty("face_match");

            var isMatchStr = faceMatch.GetProperty("isMatch").GetString();
            var similarityStr = faceMatch.GetProperty("similarity").GetString();

            if (isMatchStr == "N/A" || similarityStr == "N/A")
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_FACE_MATCH_NA, new[] 
                            {
                                EKYC_FACE_NOT_DETECTED
                            } 
                        },
                    }
                );
            }

            bool isMatch = isMatchStr == "true";

            if (
                !double.TryParse(
                    similarityStr,
                    NumberStyles.Any,
                    CultureInfo.InvariantCulture,
                    out double similarity
                )
            )
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_FACE_MATCH_INVALID, new[] { EKYC_FACE_MATCH_INVALID } },
                    }
                );
            }

            if (!isMatch || similarity < 0.8)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        {  EKYC_FACE_NOT_MATCH, new[] { EKYC_FACE_NOT_MATCH } },
                    }
                );
            }

            var ekycToken = Guid.NewGuid().ToString();

            _cache.Set($"EKYC_{ekycToken}", true, TimeSpan.FromMinutes(EKYC_EXPIRE_MINUTES));

            return ekycToken;
        }
    }
}
