using System.Linq.Expressions;

namespace DataAccess.Repositories.Interfaces
{
    public interface IRepository<T>
        where T : class
    {
        Task<IEnumerable<T>> GetAllAsync(
            string? filterOn = null,
            string? filterQuery = null,
            string? sortBy = null,
            bool? isAscending = true,
            int pageNumber = 1,
            int pageSize = 10,
            string? includeProperties = null
        );
        Task<T?> GetAsync(Expression<Func<T, bool>> filter, string? includeProperties = null);
        Task<IEnumerable<T>> GetRangeAsync(
            Expression<Func<T, bool>> filter,
            string? includeProperties = null,
            string? sortBy = null,
            bool? isAscending = true,
            int pageNumber = 1,
            int pageSize = 10
        );
        IQueryable<T> GetQueryable(string? includeProperties = null);
        Task AddAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);
        void Remove(T entity);
        void RemoveRange(IEnumerable<T> entities);
    }
}
