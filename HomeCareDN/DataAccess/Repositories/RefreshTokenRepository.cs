using DataAccess.Data;
using DataAccess.Entities.Authorize;
using DataAccess.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly AuthorizeDbContext _db;

        public RefreshTokenRepository(AuthorizeDbContext db)
        {
            _db = db;
        }

        public async Task<RefreshToken?> GetByTokenAsync(string token)
        {
            if (string.IsNullOrEmpty(token))
                throw new ArgumentNullException(nameof(token));
            return await _db.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == token);
        }

        public async Task<RefreshToken?> GetByUserIdAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId))
                throw new ArgumentNullException(nameof(userId));
            return await _db.RefreshTokens.FirstOrDefaultAsync(rt => rt.UserId == userId);
        }

        public async Task AddAsync(RefreshToken token)
        {
            if (token == null)
                throw new ArgumentNullException(nameof(token));
            await _db.RefreshTokens.AddAsync(token);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(RefreshToken token)
        {
            if (token == null)
                throw new ArgumentNullException(nameof(token));
            _db.RefreshTokens.Remove(token);
            await _db.SaveChangesAsync();
        }

        public async Task UpdateAsync(RefreshToken token)
        {
            if (token == null)
                throw new ArgumentNullException(nameof(token));

            _db.RefreshTokens.Update(token);
            await _db.SaveChangesAsync();
        }
    }
}
