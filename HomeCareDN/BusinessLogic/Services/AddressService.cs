using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using BusinessLogic.DTOs.Authorize.Address;
using BusinessLogic.DTOs.Authorize.AddressDtos;
using BusinessLogic.Services.Interfaces;
using DataAccess.Data;
using DataAccess.Entities.Authorize;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class AddressService : IAddressService
    {
        private readonly AuthorizeDbContext _db;
        private readonly IMapper _mapper;

        private const string ADDRESS_STR = "Address";
        private const string ERROR_ADDRESS_NOT_FOUND = "ADDRESS_NOT_FOUND";
        private const string ERROR_ADDRESS_ID_MISMATCH = "ADDRESS_ID_MISMATCH";
        private const string ERROR_MAX_ADDRESS = "ADDRESS_MAX";

        public AddressService(AuthorizeDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        // ===== READS =====
        public async Task<ICollection<AddressDto>> GetAddressByUserIdAsync(string userId)
        {
            var entities = await _db
                .Addresses.AsNoTracking()
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.AddressId)
                .ToListAsync();

            var dtos = _mapper.Map<ICollection<AddressDto>>(entities);
            return dtos;
        }

        // ===== WRITES =====
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
            if (dto.AddressId == Guid.Empty)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ADDRESS_STR, new[] { ERROR_ADDRESS_ID_MISMATCH } },
                };
                throw new CustomValidationException(errors);
            }

            var entity = await _db.Addresses.FirstOrDefaultAsync(a => a.AddressId == dto.AddressId);

            if (entity is null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ADDRESS_STR, new[] { ERROR_ADDRESS_NOT_FOUND } },
                };
                throw new CustomValidationException(errors);
            }

            _mapper.Map(dto, entity); // AddressId/UserId bị ignore trong AutoMapper
            await _db.SaveChangesAsync();

            return _mapper.Map<AddressDto>(entity);
        }

        public async Task DeleteAddressAsync(Guid addressId)
        {
            var entity = await _db.Addresses.FirstOrDefaultAsync(a => a.AddressId == addressId);

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
