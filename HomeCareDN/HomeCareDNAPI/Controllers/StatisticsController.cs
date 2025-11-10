using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class StatisticsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;
        public StatisticsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/bar-chart/{year:int}")]
        public async Task<IActionResult> GetBarStatistics(int year)
        {
            var statistics = await _facadeService.StatisticService.GetBarChartStatisticsAsync(year);
            return Ok(statistics);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/pie-chart/{year:int}")]
        public async Task<IActionResult> GetPieStatistics(int year)
        {
            var statistics = await _facadeService.StatisticService.GetPieChartStatisticsAsync(year);
            return Ok(statistics);
        }

        [Authorize(Roles ="Admin")]
        [HttpGet("admin/line-chart/{year:int}")]
        public async Task<IActionResult> GetLineStatistics(int year)
        {
            var statistics = await _facadeService.StatisticService.GetLineChartStatisticsAsync(year);
            return Ok(statistics);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/top-statistics")]
        public async Task<IActionResult> GetTopStatistics()
        {
            var statistics = await _facadeService.StatisticService.GetTopStatisticsAsync();
            return Ok(statistics);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/stat-statistics")]
        public async Task<IActionResult> GetStatStatistics()
        {
            var stats = await _facadeService.StatisticService.GetStatStatisticAsync();
            return Ok(stats);
        }
    }
}
