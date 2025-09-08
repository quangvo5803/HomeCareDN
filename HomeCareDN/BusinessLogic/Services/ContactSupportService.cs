using AutoMapper;
using BusinessLogic.DTOs.Application.ContactSupport;
using BusinessLogic.Services.Interfaces;               
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ContactSupportService : IContactSupportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private const string ContactSupportIdKey = "ContactSupportId";

        public ContactSupportService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ICollection<ContactSupportDto>> ListAllAsync(bool? isProcessed = null)
        {
            var query = _unitOfWork.ContactSupportRepository.GetQueryable();

            if (isProcessed.HasValue)
                query = query.Where(x => x.IsProcessed == isProcessed.Value);

            var entities = await query
                .ToListAsync();

            return _mapper.Map<ICollection<ContactSupportDto>>(entities);
        }

        public async Task<ContactSupportDto> GetByIdAsync(Guid id)
        {
            var entity = await _unitOfWork.ContactSupportRepository.GetAsync(x => x.Id == id);

            if (entity == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ContactSupportIdKey, new[] { $"ContactSupport with ID {id} not found." } },
                };
                throw new CustomValidationException(errors);
            }

            return _mapper.Map<ContactSupportDto>(entity);
        }

        public async Task<ContactSupportDto> CreateAsync(ContactSupportCreateRequestDto dto)
        {
            var entity = _mapper.Map<ContactSupport>(dto);

            await _unitOfWork.ContactSupportRepository.AddAsync(entity);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<ContactSupportDto>(entity);
        }

        // Reply (admin trả lời; set IsProcessed = true; trả về DTO sau cập nhật)
        public async Task<ContactSupportDto> ReplyAsync(Guid id, ContactSupportReplyRequestDto dto, string adminName)
        {
            var entity = await _unitOfWork.ContactSupportRepository.GetAsync(x => x.Id == id);

            if (entity == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ContactSupportIdKey, new[] { $"ContactSupport with ID {id} not found." } },
                };
                throw new CustomValidationException(errors);
            }

            entity.ReplyContent = dto.ReplyContent;
            entity.ReplyBy = adminName;
            entity.IsProcessed = true;

            await _unitOfWork.SaveAsync();

            return _mapper.Map<ContactSupportDto>(entity);
        }
        public async Task<ContactSupportDetailDto> GetDetailByIdAsync(Guid id)
        {
            var entity = await _unitOfWork.ContactSupportRepository.GetAsync(x => x.Id == id);
            if (entity == null)
                throw new CustomValidationException(new Dictionary<string, string[]>
                {
                    { ContactSupportIdKey, new[] { $"ContactSupport with ID {id} not found." } },
                });
            return _mapper.Map<ContactSupportDetailDto>(entity);
        }

        public async Task DeleteAsync(Guid id)
        {
            var entity = await _unitOfWork.ContactSupportRepository.GetAsync(x => x.Id == id);

            if (entity == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { ContactSupportIdKey, new[] { $"ContactSupport with ID {id} not found." } },
                };
                throw new CustomValidationException(errors);
            }

            _unitOfWork.ContactSupportRepository.Remove(entity);
            await _unitOfWork.SaveAsync();
        }
    }
}
