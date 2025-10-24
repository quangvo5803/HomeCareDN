using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ContactSupport;
using BusinessLogic.DTOs.Application.Partner;
using BusinessLogic.Services.FacadeService;
using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ultitity.Extensions;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublicController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public PublicController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        // ========== Brand  ==========
        [HttpGet("get-all-brands")]
        public async Task<IActionResult> GetAllBrands([FromQuery] QueryParameters parameters)
        {
            var brands = await _facadeService.BrandService.GetAllBrands(parameters);
            return Ok(brands);
        }

        [HttpGet("get-brand/{id:guid}")]
        public async Task<IActionResult> GetBrand(Guid id)
        {
            var brand = await _facadeService.BrandService.GetBrandByID(id);
            return Ok(brand);
        }

        // ========== Category  ==========

        [HttpGet("get-all-categories")]
        public async Task<IActionResult> GetAllCategories([FromQuery] QueryParameters query)
        {
            var categories = await _facadeService.CategoryService.GetAllCategories(query);
            return Ok(categories);
        }

        [HttpGet("get-category/{id:guid}")]
        public async Task<IActionResult> GetCategory(Guid id)
        {
            var category = await _facadeService.CategoryService.GetCategoryByIdAsync(id);
            return Ok(category);
        }

        // ========== Material  ==========
        [HttpGet("get-all-material")]
        public async Task<IActionResult> GetAllMaterial([FromQuery] QueryParameters parameters)
        {
            var rs = await _facadeService.MaterialService.GetAllMaterialAsync(parameters);
            return Ok(rs);
        }

        [HttpGet("get-material/{id:guid}")]
        public async Task<IActionResult> GetMaterialById(Guid id)
        {
            var rs = await _facadeService.MaterialService.GetMaterialByIdAsync(id);
            return Ok(rs);
        }

        [HttpGet("get-material-by-category/{id:guid}")]
        public async Task<IActionResult> GetMaterialByCategory(Guid id)
        {
            var rs = await _facadeService.MaterialService.GetMaterialByCategoryAsync(id);
            return Ok(rs);
        }

        [HttpGet("get-material-by-brand/{id:guid}")]
        public async Task<IActionResult> GetMaterialByBrand(Guid id)
        {
            var rs = await _facadeService.MaterialService.GetMaterialByBrandAsync(id);
            return Ok(rs);
        }

        // ====== Service =======
        [HttpGet("get-all-services")]
        public async Task<IActionResult> GetAllServices([FromQuery] QueryParameters parameters)
        {
            var services = await _facadeService.ServiceService.GetAllServicesAsync(parameters);
            return Ok(services);
        }

        [HttpGet("get-service/{id:guid}")]
        public async Task<IActionResult> GetService(Guid id)
        {
            var brand = await _facadeService.ServiceService.GetServiceByIdAsync(id);
            return Ok(brand);
        }

        // ===== Support ======
        [HttpPost("create-support")]
        public async Task<IActionResult> Create([FromBody] ContactSupportCreateRequestDto dto)
        {
            var created = await _facadeService.ContactSupportService.CreateAsync(dto);
            return Ok(created);
        }

        // ====== Partner Request ======
        [HttpPost("create-partner-request")]
        public async Task<IActionResult> CreatePartner(
            [FromForm] PartnerRequestCreateRequestDto request
        )
        {
            var partner = await _facadeService.PartnerService.CreatePartnerRequestAsync(request);
            return Ok(partner);
        }

        // ====== Enums =======
        [HttpGet("enums-all")]
        [ProducesResponseType(typeof(AllEnumsResponse), StatusCodes.Status200OK)]
        public IActionResult GetAllEnums()
        {
            var result = new AllEnumsResponse
            {
                ServiceTypes = EnumExtensions.GetEnumList<ServiceType>(),
                PackageOptions = EnumExtensions.GetEnumList<PackageOption>(),
                BuildingTypes = EnumExtensions.GetEnumList<BuildingType>(),
                MainStructures = EnumExtensions.GetEnumList<MainStructureType>(),
                DesignStyles = EnumExtensions.GetEnumList<DesignStyle>(),
                PartnerType = EnumExtensions.GetEnumList<PartnerRequestType>(),
                PartnerStatus = EnumExtensions.GetEnumList<PartneRequestrStatus>(),
            };
            return Ok(result);
        }

        // ===== Image ======
        [Authorize]
        [HttpDelete("delete-image")]
        public async Task<IActionResult> DeleteImage([FromQuery] string imageUrl)
        {
            await _facadeService.ImageService.DeleteImageAsync(imageUrl);
            return NoContent();
        }
    }
}
