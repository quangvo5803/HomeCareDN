using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class OrderDetail
    {
        [Key]
        public Guid OrderDetailID { get; set; }

        [Required]
        public required Guid OrderID { get; set; }

        [Required]
        public Guid MaterialID { get; set; }

        [Required]
        public required int Quantity { get; set; }
        public double UnitPrice { get; set; }
    }
}
