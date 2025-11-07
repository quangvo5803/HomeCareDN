using System.Linq.Expressions;
using DataAccess.Data;
using DataAccess.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Repositories
{
    public class Repository<T> : IRepository<T>
        where T : class
    {
        internal readonly DbSet<T> dbSet;

        public Repository(ApplicationDbContext db)
        {
            dbSet = db.Set<T>();
        }

        public async Task AddAsync(T entity)
        {
            await dbSet.AddAsync(entity);
        }

        public async Task AddRangeAsync(IEnumerable<T> entities)
        {
            await dbSet.AddRangeAsync(entities);
        }

        public async Task<T?> GetAsync(
            Expression<Func<T, bool>> filter,
            string? includeProperties = null,
            bool asNoTracking = true
        )
        {
            IQueryable<T> query = dbSet.Where(filter);

            if (asNoTracking)
                query = query.AsNoTracking();

            if (!string.IsNullOrEmpty(includeProperties))
            {
                foreach (
                    var includeProp in includeProperties.Split(
                        ',',
                        StringSplitOptions.RemoveEmptyEntries
                    )
                )
                {
                    query = query.Include(includeProp);
                }
            }

            return await query.FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<T>> GetRangeAsync(
            Expression<Func<T, bool>> filter,
            string? includeProperties = null,
            bool asNoTracking = true
        )
        {
            IQueryable<T> query = dbSet.Where(filter);

            if (asNoTracking)
                query = query.AsNoTracking();

            if (!string.IsNullOrEmpty(includeProperties))
            {
                foreach (
                    var includeProp in includeProperties.Split(
                        ',',
                        StringSplitOptions.RemoveEmptyEntries
                    )
                )
                {
                    query = query.Include(includeProp);
                }
            }

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<T>> GetAllAsync(
            string? includeProperties = null,
            bool asNoTracking = true
        )
        {
            IQueryable<T> query = dbSet;

            if (asNoTracking)
                query = query.AsNoTracking();

            if (!string.IsNullOrEmpty(includeProperties))
            {
                foreach (
                    var includeProp in includeProperties.Split(
                        ',',
                        StringSplitOptions.RemoveEmptyEntries
                    )
                )
                {
                    query = query.Include(includeProp);
                }
            }

            return await query.ToListAsync();
        }

        public IQueryable<T> GetQueryable(
            string? includeProperties = null,
            bool asNoTracking = true
        )
        {
            IQueryable<T> query = dbSet;

            if (asNoTracking)
                query = query.AsNoTracking();

            if (!string.IsNullOrEmpty(includeProperties))
            {
                foreach (
                    var includeProp in includeProperties.Split(
                        ',',
                        StringSplitOptions.RemoveEmptyEntries
                    )
                )
                {
                    query = query.Include(includeProp);
                }
            }

            return query;
        }

        public void Remove(T entity)
        {
            dbSet.Remove(entity);
        }

        public void RemoveRange(IEnumerable<T> entities)
        {
            dbSet.RemoveRange(entities);
        }
    }
}
