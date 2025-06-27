using System.Linq.Expressions;
using System.Reflection;
using DataAccess.Data;
using DataAccess.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Repositories
{
    public class Repository<T> : IRepository<T>
        where T : class
    {
        private readonly ApplicationDbContext _db;
        internal DbSet<T> dbSet;

        public Repository(ApplicationDbContext db)
        {
            _db = db;
            dbSet = _db.Set<T>();
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
            string? includeProperties = null
        )
        {
            IQueryable<T> query = dbSet;
            query = query.Where(filter);
            if (!string.IsNullOrEmpty(includeProperties))
            {
                foreach (
                    var includeProp in includeProperties.Split(
                        new char[] { ',' },
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
            string? sortBy = null,
            bool? isAscending = true,
            int pageNumber = 1,
            int pageSize = 10
        )
        {
            IQueryable<T> query = dbSet.AsNoTracking();
            query = query.Where(filter);

            if (!string.IsNullOrEmpty(includeProperties))
            {
                foreach (
                    var includeProp in includeProperties.Split(
                        new char[] { ',' },
                        StringSplitOptions.RemoveEmptyEntries
                    )
                )
                {
                    query = query.Include(includeProp);
                }
            }
            // Sort
            bool hasSort = false;
            if (!string.IsNullOrEmpty(sortBy))
            {
                var property = typeof(T).GetProperty(
                    sortBy,
                    BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance
                );
                if (property != null)
                {
                    query =
                        (isAscending ?? true)
                            ? query.OrderBy(e => EF.Property<object>(e, property.Name))
                            : query.OrderByDescending(e => EF.Property<object>(e, property.Name));

                    hasSort = true;
                }
            }

            // Sort by default key if no sort is specified
            if (!hasSort)
            {
                var keyProperty = typeof(T)
                    .GetProperties()
                    .FirstOrDefault(p =>
                        p.Name.Equals("Id", StringComparison.OrdinalIgnoreCase)
                        || p.Name.Equals($"{typeof(T).Name}Id", StringComparison.OrdinalIgnoreCase)
                    );

                if (keyProperty != null)
                {
                    query = query.OrderBy(e => EF.Property<object>(e, keyProperty.Name));
                }
                else
                {
                    query = query.OrderBy(e => 0);
                }
            }
            // Pagination
            if (pageNumber > 0 && pageSize > 0)
            {
                query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);
            }
            return await query.ToListAsync();
        }

        public async Task<IEnumerable<T>> GetAllAsync(
            string? filterOn = null,
            string? filterQuery = null,
            string? sortBy = null,
            bool? isAscending = true,
            int pageNumber = 1,
            int pageSize = 10,
            string? includeProperties = null
        )
        {
            IQueryable<T> query = dbSet.AsNoTracking();

            // Filter
            if (!string.IsNullOrEmpty(filterOn) && !string.IsNullOrEmpty(filterQuery))
            {
                var property = typeof(T).GetProperty(
                    filterOn,
                    BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance
                );
                if (property != null)
                {
                    query = query.Where(e =>
                        EF.Property<string>(e, property.Name).Contains(filterQuery)
                    );
                }
            }
            if (!string.IsNullOrEmpty(includeProperties))
            {
                foreach (
                    var includeProp in includeProperties.Split(
                        new char[] { ',' },
                        StringSplitOptions.RemoveEmptyEntries
                    )
                )
                {
                    query = query.Include(includeProp);
                }
            }
            // Sort
            bool hasSort = false;
            if (!string.IsNullOrEmpty(sortBy))
            {
                var property = typeof(T).GetProperty(
                    sortBy,
                    BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance
                );
                if (property != null)
                {
                    query =
                        (isAscending ?? true)
                            ? query.OrderBy(e => EF.Property<object>(e, property.Name))
                            : query.OrderByDescending(e => EF.Property<object>(e, property.Name));

                    hasSort = true;
                }
            }

            // Sort by default key if no sort is specified
            if (!hasSort)
            {
                var keyProperty = typeof(T)
                    .GetProperties()
                    .FirstOrDefault(p =>
                        p.Name.Equals("Id", StringComparison.OrdinalIgnoreCase)
                        || p.Name.Equals($"{typeof(T).Name}Id", StringComparison.OrdinalIgnoreCase)
                    );

                if (keyProperty != null)
                {
                    query = query.OrderBy(e => EF.Property<object>(e, keyProperty.Name));
                }
                else
                {
                    query = query.OrderBy(e => 0);
                }
            }
            // Pagination
            if (pageNumber > 0 && pageSize > 0)
            {
                query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);
            }

            return await query.ToListAsync();
        }

        public IQueryable<T> GetQueryable(string? includeProperties = null)
        {
            IQueryable<T> query = dbSet.AsNoTracking();

            if (!string.IsNullOrEmpty(includeProperties))
            {
                foreach (
                    var includeProp in includeProperties.Split(
                        new char[] { ',' },
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
