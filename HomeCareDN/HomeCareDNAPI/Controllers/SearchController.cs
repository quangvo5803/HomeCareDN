using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.SearchHistory;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly IFacadeService _facadeService;
        public SearchController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("search-material")]
        public async Task<IActionResult> SearchMaterial([FromQuery] QueryParameters query)
        {
            var rs = await _facadeService.SearchHistoryService.SearchMaterialAsync(query);
            return Ok(rs);
        }
        [HttpGet("search-service")]
        public async Task<IActionResult> SearchService([FromQuery] QueryParameters query)
        {
            var rs = await _facadeService.SearchHistoryService.SearchServiceAsync(query);
            return Ok(rs);
        }
        [HttpGet]
        public async Task<IActionResult> GetAllSearchHistory([FromQuery] QueryParameters query)
        {
            var rs = await _facadeService.SearchHistoryService.GetAllSearchHistoryAsync(query);
            return Ok(rs);
        }
    }
}
