using DataAccess.Entities.Application;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.DTOs.Application.SearchAndFilter
{
    public class FilterRequestDto
    {
        public string? CategoryName { get; set; }
        public Brand? Brand { get; set; }
        public double? MinUnitPrice { get; set; }
        public double? MaxUnitPrice { get; set; }
    }
}
