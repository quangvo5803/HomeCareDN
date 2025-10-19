using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Customer
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Customer")]
    public class CustomerMaterialRequestController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public CustomerMaterialRequestController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }
    }
}
