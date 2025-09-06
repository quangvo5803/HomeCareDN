using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;

namespace DataAccess.Repositories
{
    public class ChatMessageRepository : Repository<ChatMessage>, IChatMessageRepository
    {
        public ChatMessageRepository(ApplicationDbContext db) : base(db) { }
    }
}
