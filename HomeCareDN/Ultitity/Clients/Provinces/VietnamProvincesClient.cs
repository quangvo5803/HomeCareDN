using System.Net.Http.Json;
using Microsoft.Extensions.Options;
using Ultitity.Options;

namespace Ultitity.Clients.Provinces
{
    public class VietnamProvincesClient : IVietnamProvincesClient
    {
        private readonly HttpClient _http;
        private readonly VietnamProvincesOptions _opt;

        public VietnamProvincesClient(HttpClient http, IOptions<VietnamProvincesOptions> opt)
        {
            _http = http;
            _opt = opt.Value ?? throw new InvalidOperationException("Missing options.");

            if (string.IsNullOrWhiteSpace(_opt.BaseUrl))
                throw new InvalidOperationException("Missing VietnamProvinces:BaseUrl");

            var baseUri = new Uri(_opt.BaseUrl, UriKind.Absolute);

            if (!baseUri.AbsoluteUri.EndsWith("/", StringComparison.Ordinal))
                throw new InvalidOperationException(
                    "VietnamProvinces:BaseUrl must end with a slash."
                );

            _http.BaseAddress = baseUri;
        }

        public Task<object?> GetProvincesAsync(int? depth = null) =>
            _http.GetFromJsonAsync<object>(
                new Uri($"?depth={depth ?? _opt.DefaultDepth}", UriKind.Relative)
            );

        public Task<object?> GetProvinceAsync(int code, int? depth = null) =>
            _http.GetFromJsonAsync<object>(
                new Uri($"p/{code}?depth={depth ?? _opt.DefaultDepth}", UriKind.Relative)
            );

        public Task<object?> GetDistrictAsync(int code, int? depth = null) =>
            _http.GetFromJsonAsync<object>(
                new Uri($"d/{code}?depth={depth ?? _opt.DefaultDepth}", UriKind.Relative)
            );
    }
}
