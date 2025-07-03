using BusinessLogic.DTOs.Application.Cart;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public CartsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }


        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetCartByUserId(string userId)
        {
            var cart = await _facadeService.CartService.GetCartByUserIdAsync(userId);
            if (cart == null)
            {
                return NotFound();
            }
            return Ok(cart);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCart([FromBody] CartCreateRequestDto requestDto)
        {
            if (requestDto == null)
                return BadRequest("Invalid cart data.");

            var created = await _facadeService.CartService.CreateCartAsync(requestDto);
            return CreatedAtAction(nameof(GetCartByUserId), new { id = created.CartID }, created);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCart(Guid id)
        {
            try
            {
                await _facadeService.CartService.DeleteCartAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Cart with ID {id} not found.");
            }
        }
    }

}
