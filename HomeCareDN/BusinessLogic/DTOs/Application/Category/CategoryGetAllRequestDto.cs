using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.DTOs.Application.Category
{
    public class CategoryGetAllRequestDto
    {
        public string? FilterOn { get; set; } = null;
        public string? FilterQuery { get; set; } = null;
        public string? SortBy { get; set; } = null;
        public bool? IsAscending { get; set; } = true;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
