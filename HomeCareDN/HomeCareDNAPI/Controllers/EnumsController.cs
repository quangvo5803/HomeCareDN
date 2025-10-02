using DataAccess.Entities.Application;
using Microsoft.AspNetCore.Mvc;
using Ultitity.Extensions;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnumsController : ControllerBase
    {
        [HttpGet("all")]
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
    }
}
