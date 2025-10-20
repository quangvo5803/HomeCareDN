using BusinessLogic.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Net.payOS;
using Net.payOS.Types;

namespace BusinessLogic.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly PayOS _payOS;
        public PaymentService(PayOS payOS)
        {
            _payOS = payOS;
        }

        public async Task<CreatePaymentResult> CreatePaymentAsync
        (   decimal amount, 
            string description, 
            string itemName
        )
        {
            int orderCode = int.Parse(DateTimeOffset.Now.ToString("ffffff"));

            var items = new List<ItemData>
                {
                    new ItemData(itemName, 1, (int)amount)
                };

            var baseUrl = "https://www.facebook.com/"; //url react

            var paymentData = new PaymentData(
                orderCode,
                (int)amount,
                description,
                items,
                $"{baseUrl}",            //fail   
                $"{baseUrl}/DinhPhuc.Su" //ok
            );

            var result = await _payOS.createPaymentLink(paymentData);
            return result;
        }

    }
}
