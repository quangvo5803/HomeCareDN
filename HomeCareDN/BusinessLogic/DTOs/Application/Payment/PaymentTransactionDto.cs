using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.Payment
{
    public class PaymentTransactionDto
    {
        public Guid PaymentTransactionID { get; set; }
        public Guid? ServiceRequestID { get; set; }
        public Guid? MaterialRequestID { get; set; }
        public long OrderCode { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime? PaidAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
