using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Authorize.User;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogic.Services
{
    public class UserService : IUserService
    {
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        public UserService(IMapper mapper, UserManager<ApplicationUser> userManager)
        {
            _mapper = mapper;
            _userManager = userManager;
        }

        public async Task<PagedResultDto<UserDto>> GetAllUserAsync(QueryParameters parameters)
        {
            var query = _userManager.Users.Include(a => a.Addresses).AsQueryable().AsSingleQuery().AsNoTracking();

            if(!string.IsNullOrEmpty(parameters.FilterRoleName))
            {
                var roleName = (await _userManager.GetUsersInRoleAsync(parameters.FilterRoleName))
                    .Select(u=> u.Id);
                query = query.Where(u => roleName.Contains(u.Id));
            }

            if (!string.IsNullOrWhiteSpace(parameters.Search))
            {
                string keyword = parameters.Search.ToLower();
                query = query.Where(u =>
                    u.FullName.ToLower().Contains(keyword) ||
                    u.Email!.ToLower().Contains(keyword) ||
                    (u.PhoneNumber != null && u.PhoneNumber.ToLower().Contains(keyword))
                );
            }
            var totalCount = await query.CountAsync();

            query = parameters.SortBy?.ToLower() switch
            {
                "fullname" =>  query.OrderBy(u => u.FullName),
                "fullnamedesc" =>  query.OrderByDescending(u => u.FullName),
                _ => query.OrderBy(u => u.UserName),
            };
            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);

            var users = await query.ToListAsync();
            var dtos = _mapper.Map<IEnumerable<UserDto>>(users);

            return new PagedResultDto<UserDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }
    }
}
