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

        [HttpGet]
        public async Task<IActionResult> GetAllCarts([FromQuery] CartGetAllRequestDto requestDto)
        {
            var carts = await _facadeService.CartService.GetAllHardCartAsync(requestDto);
            return Ok(carts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCartById(Guid id)
        {
            var cart = await _facadeService.CartService.GetCartByIdAsync(id);
            if (cart == null)
                return NotFound();
            return Ok(cart);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCart([FromBody] CartCreateRequestDto requestDto)
        {
            if (requestDto == null)
                return BadRequest("Invalid cart data.");

            var created = await _facadeService.CartService.CreateCartAsync(requestDto);
            return CreatedAtAction(nameof(GetCartById), new { id = created.CartID }, created);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateCart([FromBody] CartUpdateRequestDto requestDto)
        {
            if (requestDto == null)
                return BadRequest("Invalid cart data.");

            var updated = await _facadeService.CartService.UpdateCartAsync(requestDto);
            return Ok(updated);
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
