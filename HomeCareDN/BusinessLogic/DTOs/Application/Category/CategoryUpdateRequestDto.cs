using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.DTOs.Application.Category
{
    public class CategoryUpdateRequestDto
    {
        [Required]
        public Guid CategoryID { get; set; }
        public string? CategoryName { get; set; }
    }
}
