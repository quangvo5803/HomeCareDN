using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.DTOs.Application.Service
{
    public class ServiceDto
    {
        public Guid ServiceID { get; set; }
        [Required]
        public required string Name { get; set; }

        public required string ServiceType { get; set; }
        public required string? PackageOption { get; set; }
        public required string BuildingType { get; set; }

        public string? Description { get; set; }
        public double PriceEsstimate { get; set; }
        public ICollection<string>? ImageUrls { get; set; }
    }
}
