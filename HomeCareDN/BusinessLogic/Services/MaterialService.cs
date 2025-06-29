using AutoMapper;
using BusinessLogic.DTOs.Application.MaterialRequest;
using BusinessLogic.DTOs.Application.SearchAndFilter;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.UnitOfWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic.Services
{
    public class MaterialService : IMaterialService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public MaterialService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
           
        }
        public async Task<MaterialRequestDto> CreateMaterialRequestAsync(
            MaterialRequestCreateMaterialRequestDto requestDto)
        {
            var material = _mapper.Map<Material>(requestDto);

            await _unitOfWork.MaterialRepository.AddAsync(material);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<MaterialRequestDto>(material);
        }

        public async Task<MaterialRequestDto> GetMaterialRequestByIdAsync(Guid id)
        {
            var material = await _unitOfWork.MaterialRepository.GetAsync(
                m => m.MaterialID == id,
                includeProperties: "Images"
            );

            if (material == null)
            {
                throw new KeyNotFoundException($"Material with ID {id} not found.");
            }

            return _mapper.Map<MaterialRequestDto>(material);
        }

        public async Task<IEnumerable<MaterialRequestDto>> GetAllHardMaterialRequestsAsync()
        {
            var materials = await _unitOfWork.MaterialRepository.GetAllAsync(
                includeProperties: "Images"
            );

            return _mapper.Map<IEnumerable<MaterialRequestDto>>(materials);
        }

        public async Task<MaterialRequestDto> UpdateMaterialRequestAsync(
            MaterialRequestUpdateMaterialRequestDto requestDto)
        {
            var material = await _unitOfWork.MaterialRepository.GetAsync(
                m => m.MaterialID == requestDto.MaterialID,
                includeProperties: "Images"
            );

            if (material == null)
            {
                throw new KeyNotFoundException(
                    $"Material with ID {requestDto.MaterialID} not found.");
            }

            _mapper.Map(requestDto, material);
            await _unitOfWork.SaveAsync();

            return _mapper.Map<MaterialRequestDto>(material);
        }

        public async Task DeleteMaterialRequestAsync(Guid id)
        {
            var material = await _unitOfWork.MaterialRepository.GetAsync(
                m => m.MaterialID == id,
                includeProperties: "Images"
            );

            if (material == null)
            {
                throw new KeyNotFoundException($"Material with ID {id} not found.");
            }

            _unitOfWork.MaterialRepository.Remove(material);
            await _unitOfWork.SaveAsync();
        }

    }
}
