using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminMaterialController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public AdminMaterialController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }
    }
}
