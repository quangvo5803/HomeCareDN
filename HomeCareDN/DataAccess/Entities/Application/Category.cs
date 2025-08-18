using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Entities.Application
{
    public class Category
    {
        [Key]
        public Guid CategoryID { get; set; }

        [Required]
        public string CategoryName { get; set; }

        public ICollection<Material>? Materials { get; set; }
    }

}
