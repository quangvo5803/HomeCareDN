namespace Ultitity.Clients.Provinces
{
    public interface IVietnamProvincesClient
    {
        Task<object?> GetProvincesAsync(int? depth = null);
        Task<object?> GetProvinceAsync(int code, int? depth = null);
        Task<object?> GetDistrictAsync(int code, int? depth = null);
    }
}
