using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Review;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public ReviewsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Admin,Distributor,Contractor"
        )]
        [HttpGet("get-all-reviews")]
        public async Task<IActionResult> GetAll([FromQuery] QueryParameters parameters)
        {
            var services = await _facadeService.ReviewService.GetAllReviewsAsync(parameters);
            return Ok(services);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Customer"
        )]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ReviewCreateRequestDto dto)
        {
            var review = await _facadeService.ReviewService.CreateReviewAsync(dto);
            return Ok(review);
        }
    }
}
