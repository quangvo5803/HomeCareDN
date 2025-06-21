using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Order
    {
        [Key]
        public Guid OrderId { get; set; }

        [Required]
        public required string UserID { get; set; }

        [Required]
        public required string ShippingAddress { get; set; }

        [Required]
        public required string PhoneNumber { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.Now;
        public double TotalAmount { get; set; }
        public OrderStatus Status { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public ICollection<OrderDetail>? OrderDetails { get; set; }
    }

    public enum PaymentMethod
    {
        OnlinePayment,
        CashOnDelivery,
    }

    public enum OrderStatus
    {
        Pending,
        Processing,
        Shipped,
        Delivered,
        Cancelled,
    }
}
