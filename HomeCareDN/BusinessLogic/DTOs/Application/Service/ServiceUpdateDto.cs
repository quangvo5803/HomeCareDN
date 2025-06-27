using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.DTOs.Application.Service
{
    public class ServiceUpdateDto
    {
        public Guid ServiceID { get; set; }
        [Required]
        public required string Name { get; set; }
        public string? Description { get; set; }
        public double PriceEsstimate { get; set; }
        public List<IFormFile>? Images { get; set; }
    }
}
