using DataAccess.Entities.Authorize;
using Microsoft.AspNetCore.Identity;

namespace BusinessLogic.Services.FacadeService.Dependencies
{
    public class IdentityDependencies
    {
        public UserManager<ApplicationUser> UserManager { get; }
        public RoleManager<IdentityRole> RoleManager { get; }

        public IdentityDependencies(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager
        )
        {
            UserManager = userManager;
            RoleManager = roleManager;
        }
    }
}
