using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.ServiceRequest;
using BusinessLogic.DTOs.Authorize.User;
using BusinessLogic.Services.Interfaces;
using DataAccess.Data;
using DataAccess.Entities.Authorize;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class UserService : IUserService
    {
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AuthorizeDbContext _db;

        private const string ADDRESS_STR = "Address";
        private const string ERROR_ADDRESS_NOT_FOUND = "ADDRESS_NOT_FOUND";
        private const string ERROR_ADDRESS_ID_MISMATCH = "ADDRESS_ID_MISMATCH";
        private const string ERROR_MAX_ADDRESS = "ADDRESS_MAX";

        public UserService(
            IMapper mapper,
            UserManager<ApplicationUser> userManager,
            AuthorizeDbContext db
        )
        {
            _mapper = mapper;
            _userManager = userManager;
            _db = db;
        }

        // =========================== User ===========================

        public async Task<PagedResultDto<UserDto>> GetAllUserAsync(QueryParameters parameters)
        {
            var query = _userManager
                .Users.Include(a => a.Addresses)
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
                var roleUsers = await _userManager.GetUsersInRoleAsync(parameters.FilterRoleName);
                var roleIds = roleUsers.Select(u => u.Id);
                query = query.Where(u => roleIds.Contains(u.Id));
            }

            if (!string.IsNullOrWhiteSpace(parameters.Search))
            {
                string keyword = parameters.Search.ToLower();
                query = query.Where(u =>
                    u.FullName.ToLower().Contains(keyword)
                    || u.Email!.ToLower().Contains(keyword)
                    || (u.PhoneNumber != null && u.PhoneNumber.ToLower().Contains(keyword))
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
            foreach (var dto in dtos)
            {
                var user = users.First(u => u.Id == dto.UserID);
                var role = await _userManager.GetRolesAsync(user);
                dto.Role = role.FirstOrDefault();
            }
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
            var user = await _userManager
                .Users.Include(u => u.Addresses)
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

            var dto = _mapper.Map<UserDto>(user);

            var role = await _userManager.GetRolesAsync(user);
            dto.Role = role.FirstOrDefault();

            dto.Addresses = _mapper.Map<List<AddressDto>>(user.Addresses);
            return dto;
        }

        public async Task UpdateUserAsync(UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(dto.UserId);
            if (user is null)
            {
                var dict = new Dictionary<string, string[]>
                {
                    { "USER", new[] { "USER_NOT_FOUND" } },
                };
                throw new CustomValidationException(dict);
            }

            _mapper.Map(dto, user);
            await _userManager.UpdateAsync(user);
        }

        //=========================== Address ===========================

        public async Task<AddressDto> CreateAddressByUserIdAsync(CreateAddressDto dto)
        {
            var userAddress = await _db.Addresses.Where(a => a.UserId == dto.UserId).ToListAsync();
            if (userAddress?.Count == 5)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ADDRESS_STR, new[] { ERROR_MAX_ADDRESS } },
                };
                throw new CustomValidationException(errors);
            }
            var entity = _mapper.Map<Address>(dto);
            _db.Addresses.Add(entity);
            await _db.SaveChangesAsync();
            return _mapper.Map<AddressDto>(entity);
        }

        public async Task<AddressDto> UpdateAddressAsync(UpdateAddressDto dto)
        {
            if (dto.AddressID == Guid.Empty)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ADDRESS_STR, new[] { ERROR_ADDRESS_ID_MISMATCH } },
                };
                throw new CustomValidationException(errors);
            }

            var entity = await _db.Addresses.FirstOrDefaultAsync(a => a.AddressID == dto.AddressID);

            if (entity is null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ADDRESS_STR, new[] { ERROR_ADDRESS_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            _mapper.Map(dto, entity);
            await _db.SaveChangesAsync();

            return _mapper.Map<AddressDto>(entity);
        }

        public async Task DeleteAddressAsync(Guid addressId)
        {
            var entity = await _db.Addresses.FirstOrDefaultAsync(a => a.AddressID == addressId);

            if (entity is null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ADDRESS_STR, new[] { ERROR_ADDRESS_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            _db.Addresses.Remove(entity);
            await _db.SaveChangesAsync();
        }
    }
}
