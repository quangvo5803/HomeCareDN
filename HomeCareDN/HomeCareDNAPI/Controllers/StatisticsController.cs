using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        //================= Admin =================

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/bar-chart/{year:int}")]
        public async Task<IActionResult> GetBarStatistics(int year)
        {
            var statistics = await _facadeService.StatisticService.GetAdminBarChartAsync(year);
            return Ok(statistics);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/pie-chart/{year:int}")]
        public async Task<IActionResult> GetPieStatistics(int year)
        {
            var statistics = await _facadeService.StatisticService.GetPieChartStatisticsAsync(year);
            return Ok(statistics);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/line-chart/{year:int}")]
        public async Task<IActionResult> GetLineStatistics(int year)
        {
            var statistics = await _facadeService.StatisticService.GetAdminLineChartAsync(
                year
            );
            return Ok(statistics);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/top-statistics")]
        public async Task<IActionResult> GetTopStatistics()
        {
            var statistics = await _facadeService.StatisticService.GetAdminTopAsync();
            return Ok(statistics);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/stat-statistics")]
        public async Task<IActionResult> GetStatStatistics()
        {
            var stats = await _facadeService.StatisticService.GetAdminStatAsync();
            return Ok(stats);
        }

        //================= Contractor =================

        [Authorize(Roles = "Contractor")]
        [HttpGet("contractor/stat-statistics")]
        public async Task<IActionResult> GetStatForContractorStatistics()
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(sub, out var contractorId))
                return Unauthorized("Invalid contractor ID.");

            var result =
                await _facadeService.StatisticService.GetContractorStatAsync(
                    contractorId
                );
            return Ok(result);
        }

        [Authorize(Roles = "Contractor")]
        [HttpGet("contractor/bar-chart/{year:int}")]
        public async Task<IActionResult> GetBarForContractorStatistics(int year, Guid contractorID)
        {
            var statistics =
                await _facadeService.StatisticService.GetContractorBarChartAsync(
                    year,
                    contractorID
                );
            return Ok(statistics);
        }

        [Authorize(Roles = "Contractor")]
        [HttpGet("contractor/line-chart/{year:int}")]
        public async Task<IActionResult> GetLineForContractorStatistics(int year, Guid contractorID)
        {
            var statistics =
                await _facadeService.StatisticService.GetContractorLineChartAsync(
                    year,
                    contractorID
                );
            return Ok(statistics);
        }
    }
}
