using System.Linq.Expressions;

namespace DataAccess.Repositories.Interfaces
{
    public interface IRepository<T>
        where T : class
    {
        Task<IEnumerable<T>> GetAllAsync(
            string? includeProperties = null,
            bool asNoTracking = true
        );
        Task<T?> GetAsync(
            Expression<Func<T, bool>> filter,
            string? includeProperties = null,
            bool asNoTracking = true
        );
        Task<IEnumerable<T>> GetRangeAsync(
            Expression<Func<T, bool>> filter,
            string? includeProperties = null,
            bool asNoTracking = true
        );
        IQueryable<T> GetQueryable(string? includeProperties = null, bool asNoTracking = true);
        Task AddAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);
        void Remove(T entity);
        void RemoveRange(IEnumerable<T> entities);
    }
}
