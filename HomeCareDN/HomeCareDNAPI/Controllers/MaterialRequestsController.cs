using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.MaterialRequest;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/material-requests")]
    [ApiController]
    public class MaterialRequestsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public MaterialRequestsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        // ====================== ADMIN ======================
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllForAdmin([FromQuery] QueryParameters parameters)
        {
            var result = await _facadeService.MaterialRequestService.GetAllMaterialRequestsAsync(
                parameters
            );
            return Ok(result);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpGet("admin/{id:guid}")]
        public async Task<IActionResult> GetByIdForAdmin(Guid id)
        {
            var result = await _facadeService.MaterialRequestService.GetMaterialRequestByIdAsync(
                id
            );
            return Ok(result);
        }

        // ====================== CUSTOMER ======================
        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Customer"
        )]
        [HttpGet("my-requests")]
        public async Task<IActionResult> GetAllForCustomer([FromQuery] QueryParameters parameters)
        {
            var result =
                await _facadeService.MaterialRequestService.GetAllMaterialRequestByUserIdAsync(
                    parameters
                );
            return Ok(result);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpGet("customer/{id:guid}")]
        public async Task<IActionResult> GetByIdForCustomer(Guid id)
        {
            var result = await _facadeService.MaterialRequestService.GetMaterialRequestByIdAsync(
                id,
                "Customer"
            );
            return Ok(result);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Customer"
        )]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MaterialRequestCreateRequestDto dto)
        {
            var result = await _facadeService.MaterialRequestService.CreateNewMaterialRequestAsync(
                dto
            );
            return Ok(result);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Customer"
        )]
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] MaterialRequestUpdateRequestDto dto)
        {
            var result = await _facadeService.MaterialRequestService.UpdateMaterialRequestAsync(
                dto
            );
            return Ok(result);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Customer"
        )]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _facadeService.MaterialRequestService.DeleteMaterialRequest(id);
            return NoContent();
        }

        // ====================== DISTRIBUTOR ======================
        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Distributor"
        )]
        [HttpGet("distributor")]
        public async Task<IActionResult> GetAllForDistributor(
            [FromQuery] QueryParameters parameters
        )
        {
            var result = await _facadeService.MaterialRequestService.GetAllMaterialRequestsAsync(
                parameters,
                "Distributor"
            );
            return Ok(result);
        }

        [Authorize(
            AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
            Roles = "Distributor"
        )]
        [HttpGet("distributor/{id:guid}")]
        public async Task<IActionResult> GetByIdForDistributor(Guid id)
        {
            var result = await _facadeService.MaterialRequestService.GetMaterialRequestByIdAsync(
                id,
                "Distributor"
            );
            return Ok(result);
        }
    }
}
