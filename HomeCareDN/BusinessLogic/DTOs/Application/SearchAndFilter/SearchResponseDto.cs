using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.DTOs.Application.SearchAndFilter
{
    public class SearchResponseDto
    {
        public int? UserId { get; set; }
        public double Price { get; set; }
        public string? UserName { get; set; }
        public string? Description { get; set; }
        public ICollection<string>? ImageUrls { get; set; }
    }
}
