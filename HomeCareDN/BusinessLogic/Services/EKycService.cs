using System.Globalization;
using System.Text.Json;
using BusinessLogic.DTOs.Application.EKyc;
using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Http;
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
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const int EKYC_EXPIRE_MINUTES = 10;

        private const string EKYC_MISSING_INPUT = "EKYC_MISSING_INPUT";

        //cccd
        private const string EKYC_CCCD_NOT_DETECTED = "EKYC_CCCD_NOT_DETECTED";
        private const string EKYC_CCCD_INVALID = "EKYC_CCCD_INVALID";
        private const string EKYC_CCCD_ID_INVALID = "EKYC_CCCD_ID_INVALID";
        private const string EKYC_CCCD_IMAGE_QUALITY_LOW = "EKYC_CCCD_IMAGE_QUALITY_LOW";

        //face
        private const string EKYC_FACE_NOT_MATCH = "EKYC_FACE_NOT_MATCH";
        private const string EKYC_SELFIE_INVALID = "EKYC_SELFIE_INVALID";
        private const string EKYC_FACE_NOT_DETECTED = "EKYC_FACE_NOT_DETECTED";
        private const string EKYC_FACE_IMAGE_QUALITY_LOW = "EKYC_FACE_IMAGE_QUALITY_LOW";

        // Anti spam
        public const string EKYC_COOLDOWN_ACTIVE = "EKYC_COOLDOWN_ACTIVE";

        private const int EKYC_MAX_FAIL = 3;
        private static readonly TimeSpan EKYC_COOLDOWN = TimeSpan.FromHours(1);

        public EKycService(
            IFptAiClient fptAiClient,
            IMemoryCache cache,
            IHttpContextAccessor httpContextAccessor
        )
        {
            _fptAiClient = fptAiClient;
            _cache = cache;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<string> VerifyAsync(EKycVerifyRequestDto requestDto)
        {
            EnsureNotLocked();
            ValidateInput(requestDto);

            try
            {
                var ocrResult = await GetOcrResultAsync(requestDto.CccdImage);
                var cccd = ValidateOcrData(ocrResult);

                ValidateProbabilities(cccd);

                var faceData = await GetFaceDataAsync(requestDto.CccdImage, requestDto.SelfieImage);
                ValidateFaceData(faceData);

                var ekycToken = Guid.NewGuid().ToString();
                _cache.Set($"EKYC_{ekycToken}", true, TimeSpan.FromMinutes(EKYC_EXPIRE_MINUTES));
                ResetFailCount();
                return ekycToken;
            }
            catch (CustomValidationException)
            {
                IncreaseFailCount();
                throw;
            }
        }

        //======= Helper methods ========

        private static void ValidateInput(EKycVerifyRequestDto requestDto)
        {
            if (requestDto.CccdImage == null || requestDto.SelfieImage == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_MISSING_INPUT, new[] { EKYC_MISSING_INPUT } },
                    }
                );
            }
        }

        private async Task<FptOcrCccdResponse> GetOcrResultAsync(IFormFile cccdImage)
        {
            try
            {
                var ocrJson = await _fptAiClient.OcrCccdAsync(cccdImage);
                var ocrResult = JsonSerializer.Deserialize<FptOcrCccdResponse>(
                    ocrJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                )!;
                if (ocrResult == null || ocrResult.ErrorCode != 0)
                    throw new CustomValidationException(
                        new Dictionary<string, string[]>
                        {
                            { EKYC_CCCD_INVALID, new[] { EKYC_CCCD_INVALID } },
                        }
                    );

                if (ocrResult.Data == null || ocrResult.Data.Count == 0)
                    throw new CustomValidationException(
                        new Dictionary<string, string[]>
                        {
                            { EKYC_CCCD_NOT_DETECTED, new[] { EKYC_CCCD_NOT_DETECTED } },
                        }
                    );

                return ocrResult;
            }
            catch
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_CCCD_INVALID, new[] { EKYC_CCCD_INVALID } },
                    }
                );
            }
        }

        private static FptOcrCccdData ValidateOcrData(FptOcrCccdResponse ocrResult)
        {
            var cccd = ocrResult.Data[0];

            if (string.IsNullOrWhiteSpace(cccd.Type))
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_CCCD_NOT_DETECTED, new[] { EKYC_CCCD_NOT_DETECTED } },
                    }
                );

            if (string.IsNullOrWhiteSpace(cccd.Id) || cccd.Id.Length < 9)
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_CCCD_ID_INVALID, new[] { EKYC_CCCD_ID_INVALID } },
                    }
                );

            return cccd;
        }

        private static void ValidateProbabilities(FptOcrCccdData cccd)
        {
            bool LowProb(string prob, double min = 0.7) =>
                !double.TryParse(prob, NumberStyles.Any, CultureInfo.InvariantCulture, out var v)
                || v < min;

            if (LowProb(cccd.Id_prob) || LowProb(cccd.Name_prob) || LowProb(cccd.Dob_prob))
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_CCCD_IMAGE_QUALITY_LOW, new[] { EKYC_CCCD_IMAGE_QUALITY_LOW } },
                    }
                );
            }
        }

        private async Task<JsonElement> GetFaceDataAsync(IFormFile cccdImage, IFormFile selfieImage)
        {
            var faceJson = await _fptAiClient.CheckFaceAsync(cccdImage, selfieImage);
            var faceDoc = JsonDocument.Parse(faceJson);
            var root = faceDoc.RootElement;

            if (root.ValueKind != JsonValueKind.Object)
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_SELFIE_INVALID, new[] { EKYC_SELFIE_INVALID } },
                    }
                );

            if (root.TryGetProperty("errorCode", out _))
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_FACE_NOT_DETECTED, new[] { EKYC_FACE_NOT_DETECTED } },
                    }
                );

            if (
                !root.TryGetProperty("data", out var data)
                || data.ValueKind != JsonValueKind.Object
            )
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_SELFIE_INVALID, new[] { EKYC_SELFIE_INVALID } },
                    }
                );

            return data;
        }

        private static void ValidateFaceData(JsonElement data)
        {
            bool isMatch = data.GetProperty("isMatch").GetBoolean();
            double similarity = data.GetProperty("similarity").GetDouble();
            bool isBothImgIDCard = data.GetProperty("isBothImgIDCard").GetBoolean();

            if (isBothImgIDCard)
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_SELFIE_INVALID, new[] { EKYC_SELFIE_INVALID } },
                    }
                );

            if (similarity < 10)
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_FACE_NOT_DETECTED, new[] { EKYC_FACE_NOT_DETECTED } },
                    }
                );

            if (similarity < 50)
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_FACE_IMAGE_QUALITY_LOW, new[] { EKYC_FACE_IMAGE_QUALITY_LOW } },
                    }
                );

            if (!isMatch || similarity < 80)
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_FACE_NOT_MATCH, new[] { EKYC_FACE_NOT_MATCH } },
                    }
                );
        }

        private string GetClientKey()
        {
            return _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString()
                ?? "UNKNOWN";
        }

        private void EnsureNotLocked()
        {
            var lockKey = $"EKYC_LOCK_{GetClientKey()}";

            if (_cache.TryGetValue(lockKey, out _))
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { EKYC_COOLDOWN_ACTIVE, new[] { EKYC_COOLDOWN_ACTIVE } },
                    }
                );
            }
        }

        private void IncreaseFailCount()
        {
            var failKey = $"EKYC_FAIL_{GetClientKey()}";
            var lockKey = $"EKYC_LOCK_{GetClientKey()}";

            int count = _cache.Get<int?>(failKey) ?? 0;
            count++;

            if (count >= EKYC_MAX_FAIL)
            {
                _cache.Set(lockKey, true, EKYC_COOLDOWN);
                _cache.Remove(failKey);
            }
            else
            {
                _cache.Set(failKey, count, EKYC_COOLDOWN);
            }
        }

        private void ResetFailCount()
        {
            var failKey = $"EKYC_FAIL_{GetClientKey()}";
            _cache.Remove(failKey);
        }
    }
}
