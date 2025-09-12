namespace Ultitity.Clients.Provinces
{
    public interface IVietnamProvincesClient
    {
        Task<object?> GetProvincesAsync(int? depth = null);
        Task<object?> GetProvinceAsync(int code, int? depth = null); // trả về cả districts nếu depth=2
        Task<object?> GetDistrictAsync(int code, int? depth = null); // trả về cả wards nếu depth=2
    }
}
