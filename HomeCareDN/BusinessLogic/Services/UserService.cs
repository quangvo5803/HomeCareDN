using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ContractorApplication;
using BusinessLogic.DTOs.Application.ServiceRequest;
using BusinessLogic.DTOs.Authorize.AddressDtos;
using BusinessLogic.DTOs.Authorize.User;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class UserService : IUserService
    {
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IUnitOfWork _unitOfWork;
        public UserService(IMapper mapper, UserManager<ApplicationUser> userManager, IUnitOfWork unitOfWork)
        {
            _mapper = mapper;
            _userManager = userManager;
            _unitOfWork = unitOfWork;
        }

        public async Task<PagedResultDto<UserDto>> GetAllUserAsync(QueryParameters parameters)
        {
            var query = _userManager.Users
                .Include(a => a.Addresses)
                .AsQueryable()
                .AsSingleQuery()
                .AsNoTracking();

            var allowedRoles = new[] { "Customer", "Contractor", "Distributor" };

            var userIdsInAllowedRoles = new List<string>();

            foreach (var role in allowedRoles)
            {
                var usersInRole = await _userManager.GetUsersInRoleAsync(role);
                userIdsInAllowedRoles.AddRange(usersInRole.Select(u => u.Id));
            }

            query = query.Where(u => userIdsInAllowedRoles.Contains(u.Id));

            if (!string.IsNullOrEmpty(parameters.FilterRoleName))
            {
                var roleName = parameters.FilterRoleName;
                var roleUsers = await _userManager.GetUsersInRoleAsync(roleName);
                var roleIds = roleUsers.Select(u => u.Id);
                query = query.Where(u => roleIds.Contains(u.Id));
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
                "fullname" => query.OrderBy(u => u.FullName),
                "fullnamedesc" => query.OrderByDescending(u => u.FullName),
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

        public async Task<UserDto> GetUserByIdAsync(string userID)
        {
            var user = await _userManager.Users
                .Include(u => u.Addresses)
                .AsSingleQuery()
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userID);

            if (user == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { "UserID Null", new[] { "UserID Not Found" } },
                    }
                );
            }
            var serviceRequests = await _unitOfWork.ServiceRequestRepository
                .GetRangeAsync(sr => sr.CustomerID.ToString() == userID);

            var dto = _mapper.Map<UserDto>(user);

            var role = await _userManager.GetRolesAsync(user);
            dto.Role = role.FirstOrDefault();

            dto.ServiceRequests = 
                _mapper.Map<List<ServiceRequestDto>>(serviceRequests);
            dto.Address = _mapper.Map<List<AddressDto>>(user.Addresses);
            return dto;
        }
    }
}
