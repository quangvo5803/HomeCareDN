using System;
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
            _opt = opt.Value;
            _http.BaseAddress = new Uri(_opt.BaseUrl.TrimEnd('/') + "/");
        }

        public Task<object?> GetProvincesAsync(int? depth = null) =>
            _http.GetFromJsonAsync<object>($"?depth={depth ?? _opt.DefaultDepth}");

        public Task<object?> GetProvinceAsync(int code, int? depth = null) =>
            _http.GetFromJsonAsync<object>($"p/{code}?depth={depth ?? _opt.DefaultDepth}");

        public Task<object?> GetDistrictAsync(int code, int? depth = null) =>
            _http.GetFromJsonAsync<object>($"d/{code}?depth={depth ?? _opt.DefaultDepth}");
    }
}
