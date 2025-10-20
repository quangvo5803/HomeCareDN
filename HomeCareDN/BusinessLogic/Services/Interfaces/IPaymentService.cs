using Net.payOS.Types;

namespace BusinessLogic.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<CreatePaymentResult> CreatePaymentAsync(decimal amount, string description, string itemName);
    }
}
