using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.DTOs.Chat.Ai
{
    public class AiChatMessageDto
    {
        public string Role { get; set; } = "user"; // "user" | "assistant"
        public string Content { get; set; } = "";
        public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
    }
}
