using System.Security.Claims;
using BusinessLogic.DTOs.Application.Chat.User;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(
        AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
        Roles = "Customer,Contractor"
    )]
    public class ConversationsController : ControllerBase
    {
        private readonly IFacadeService _facade;

        public ConversationsController(IFacadeService facade)
        {
            _facade = facade;
        }
    }
}
