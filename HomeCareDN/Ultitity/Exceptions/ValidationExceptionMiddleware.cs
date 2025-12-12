using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace Ultitity.Exceptions
{
    public class ValidationExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ValidationExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (CustomValidationException ex)
            {
                await WriteJsonAsync(
                    context,
                    StatusCodes.Status400BadRequest,
                    new { message = ex.Message, errors = ex.Errors }
                );
            }
            catch (Exception ex)
            {
                await WriteJsonAsync(
                    context,
                    StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred.", detail = ex.Message }
                );
            }
        }

        private static async Task WriteJsonAsync(
            HttpContext context,
            int statusCode,
            object payload
        )
        {
            // Nếu response đã bắt đầu → không ghi tiếp nữa (tránh connection closed)
            if (context.Response.HasStarted)
                return;

            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";

            var json = JsonSerializer.Serialize(payload);

            await context.Response.WriteAsync(json);
        }
    }
}
