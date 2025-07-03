using BusinessLogic.DTOs.Application.CartItem;
using BusinessLogic.Services.FacadeService;
using Microsoft.AspNetCore.Mvc;

namespace HomeCareDNAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartItemsController : ControllerBase
    {
        private readonly IFacadeService _facadeService;

        public CartItemsController(IFacadeService facadeService)
        {
            _facadeService = facadeService;
        }

        [HttpGet("cart/{cartId}")]
        public async Task<IActionResult> GetByCartId(Guid cartId)
        {
            var dto = new CartItemGetAllByCartIdRequestDto { CartID = cartId };
            var items = await _facadeService.CartItemService.GetAllCartItemsByCartIdAsync(dto);
            return Ok(items);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var item = await _facadeService.CartItemService.GetCartItemByIdAsync(id);
            return Ok(item);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CartItemCreateRequestDto requestDto)
        {
            if (requestDto == null)
                return BadRequest("Invalid cart item data.");

            var created = await _facadeService.CartItemService.CreateCartItemAsync(requestDto);
            return CreatedAtAction(nameof(GetById), new { id = created.CartItemID }, created);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] CartItemUpdateRequestDto requestDto)
        {
            if (requestDto == null)
                return BadRequest("Invalid cart item data.");

            var updated = await _facadeService.CartItemService.UpdateCartItemAsync(requestDto);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _facadeService.CartItemService.DeleteCartItemAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
