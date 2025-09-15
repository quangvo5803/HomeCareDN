using System.ComponentModel.DataAnnotations;

namespace Ultitity.Options
{
    public class VietnamProvincesOptions
    {
        [Required, Url]
        public string BaseUrl { get; set; } = null!;
        public int DefaultDepth { get; set; }
    }
}
