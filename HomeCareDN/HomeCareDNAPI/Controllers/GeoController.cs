using Microsoft.AspNetCore.Mvc;
using Ultitity.Clients.Provinces;

namespace HomeCareDNAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GeoController : ControllerBase
{
    private readonly IVietnamProvincesClient _client;

    public GeoController(IVietnamProvincesClient client) => _client = client;

    // GET api/geo/provinces
    [HttpGet("provinces")]
    public async Task<IActionResult> Provinces([FromQuery] int? depth = 1) =>
        Ok(await _client.GetProvincesAsync(depth));

    // GET api/geo/districts?provinceCode=1
    [HttpGet("districts")]
    public async Task<IActionResult> Districts([FromQuery] int provinceCode)
    {
        var province = await _client.GetProvinceAsync(provinceCode, 2);
        // province JSON có trường "districts" theo mẫu /?depth=2 trên trang chủ
        return Ok(province);
    }

    // GET api/geo/wards?districtCode=2
    [HttpGet("wards")]
    public async Task<IActionResult> Wards([FromQuery] int districtCode)
    {
        var district = await _client.GetDistrictAsync(districtCode, 2);
        return Ok(district);
    }
}
