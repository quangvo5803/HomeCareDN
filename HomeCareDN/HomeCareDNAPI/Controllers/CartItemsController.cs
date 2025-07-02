using BusinessLogic.DTOs.Application.Cart;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartItemsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;
        public CartItemsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCartItems([FromQuery] CartItemGetAllRequestDto requestDto)
        {
            var items = await _facadeService.CartItemService.GetAllHardCartItemAsync(requestDto);
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCartItemById(Guid id)
        {
            var item = await _facadeService.CartItemService.GetCartItemByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCartItem([FromBody] CartItemCreateRequestDto requestDto)
        {
            if (requestDto == null)
                return BadRequest("Invalid cart item data.");

            var created = await _facadeService.CartItemService.CreateCartItemAsync(requestDto);
            return CreatedAtAction(nameof(GetCartItemById), new { id = created.CartItemID }, created);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateCartItem([FromBody] CartItemUpdateRequestDto requestDto)
        {
            if (requestDto == null)
                return BadRequest("Invalid cart item data.");

            var updated = await _facadeService.CartItemService.UpdateCartItemAsync(requestDto);
            return Ok(updated);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCartItem(Guid id)
        {
            try
            {
                await _facadeService.CartItemService.DeleteCartItemAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"CartItem with ID {id} not found.");
            }
        }
    }
}
