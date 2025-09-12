using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessLogic.DTOs.Authorize.Address;
using BusinessLogic.DTOs.Authorize.AddressDtos;
using BusinessLogic.Services.Interfaces;
using DataAccess.Data;
using DataAccess.Entities.Authorize;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class AddressService : IAddressService
    {
        private readonly AuthorizeDbContext _db;
        private readonly IHttpContextAccessor _http;
        private readonly IMapper _mapper;

        private const string ADDRESS_STR = "Address";
        private const string ERROR_ADDRESS_NOT_FOUND = "ADDRESS_NOT_FOUND";

        public AddressService(AuthorizeDbContext db, IHttpContextAccessor http, IMapper mapper)
        {
            _db = db;
            _http = http;
            _mapper = mapper;
        }

        private string RequireUserId()
        {
            var u = _http.HttpContext?.User;
            var id =
                u?.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? u?.FindFirst("nameid")?.Value
                ?? u?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? u?.FindFirst("uid")?.Value
                ?? u?.FindFirst("userId")?.Value;

            if (string.IsNullOrWhiteSpace(id))
                throw new UnauthorizedAccessException("User is not authenticated.");

            return id;
        }

        // ===== READS =====
        public async Task<IReadOnlyList<AddressDto>> GetMineAsync()
        {
            var userId = RequireUserId();

            return await _db
                .Addresses.Where(a => a.UserId == userId)
                .AsNoTracking()
                .OrderByDescending(a => a.Id)
                .ProjectTo<AddressDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<AddressDto> GetByIdAsync(Guid id)
        {
            var userId = RequireUserId();

            var dto = await _db
                .Addresses.Where(a => a.UserId == userId && a.Id == id)
                .AsNoTracking()
                .ProjectTo<AddressDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            if (dto is null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ADDRESS_STR, new[] { ERROR_ADDRESS_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }
            return dto;
        }

        // ===== WRITES =====
        public async Task<AddressDto> CreateAsync(CreateAddressDto dto)
        {
            var userId = RequireUserId();

            var entity = _mapper.Map<Address>(dto);
            entity.UserId = userId;

            _db.Addresses.Add(entity);
            await _db.SaveChangesAsync();

            return _mapper.Map<AddressDto>(entity);
        }

        public async Task UpdateAsync(Guid id, UpdateAddressDto dto)
        {
            var userId = RequireUserId();

            var entity = await _db.Addresses.FirstOrDefaultAsync(a =>
                a.Id == id && a.UserId == userId
            );

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
        }

        public async Task DeleteAsync(Guid id)
        {
            var userId = RequireUserId();

            var entity = await _db.Addresses.FirstOrDefaultAsync(a =>
                a.Id == id && a.UserId == userId
            );

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
