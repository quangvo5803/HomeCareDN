using System.Threading.Tasks;
using DataAccess.Entities.Authorize;

namespace DataAccess.Repositories.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken?> GetByTokenAsync(string token);
        Task<RefreshToken?> GetByUserIdAsync(string userId);
        Task AddAsync(RefreshToken token);
        Task DeleteAsync(RefreshToken token);
        Task UpdateAsync(RefreshToken token);
    }
}
