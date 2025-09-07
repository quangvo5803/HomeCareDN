using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Entities.Application
{
    public class ContactSupport
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string FullName { get; set; } = default!;

        [Required, EmailAddress]
        public string Email { get; set; } = default!;

        [Required]
        public string Subject { get; set; } = default!;

        [Required]
        public string Message { get; set; } = default!;
        public bool IsProcessed { get; set; } = false;
        public string? ReplyContent { get; set; }
        public string? ReplyBy { get; set; }
    }
}
