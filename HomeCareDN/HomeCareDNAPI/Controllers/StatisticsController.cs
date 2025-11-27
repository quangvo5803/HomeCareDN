using System.Security.Claims;
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

        [Authorize(Roles = "Admin, Contractor, Distributor")]
        [HttpGet("bar-chart")]
        public async Task<IActionResult> GetBarChart(
            [FromQuery] int year,
            [FromQuery] string role,
            [FromQuery] Guid? contractorId = null,
            [FromQuery] Guid? distributorId = null
        )
        {
            var statistics = await _facadeService.StatisticService.GetBarChartAsync(
                year,
                role,
                contractorId,
                distributorId
            );
            return Ok(statistics);
        }

        [Authorize(Roles = "Admin, Contractor, Distributor")]
        [HttpGet("line-chart")]
        public async Task<IActionResult> GetLineStatistics(
            [FromQuery] int year,
            [FromQuery] string role,
            [FromQuery] Guid? contractorId = null,
            [FromQuery] Guid? distributorId = null
        )
        {
            var statistics = await _facadeService.StatisticService.GetLineChartAsync(
                year,
                role,
                contractorId,
                distributorId
            );
            return Ok(statistics);
        }

        //================= Admin =================

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/pie-chart/{year:int}")]
        public async Task<IActionResult> GetPieStatistics(int year)
        {
            var statistics = await _facadeService.StatisticService.GetPieChartStatisticsAsync(year);
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

            var result = await _facadeService.StatisticService.GetContractorStatAsync(contractorId);
            return Ok(result);
        }

        //================= Distributor =================
        [Authorize(Roles = "Distributor")]
        [HttpGet("distributor/stat-statistics")]
        public async Task<IActionResult> GetStatForDistributorStatistics()
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(sub, out var distributorId))
                return Unauthorized("Invalid distributor ID.");

            var result = await _facadeService.StatisticService.GetDistributorStatAsync(
                distributorId
            );
            return Ok(result);
        }
    }
}
