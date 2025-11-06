using AutoMapper;
using BusinessLogic.DTOs.Application.Static;
using BusinessLogic.DTOs.Application.Statistic;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class StatisticService : IStatisticService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        public StatisticService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
        }

        public async Task<IEnumerable<AdminLineChartDto>> GetLineStatisticsAsync(int year)
        {
            var statisticsLine = await _unitOfWork.ContractorApplicationRepository
                .GetRangeAsync(sta => sta.Status == ApplicationStatus.Approved && 
                    sta.CreatedAt.Year == year, includeProperties:"ServiceRequest"
                );

            if (statisticsLine == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { "Line Chart Null", new[] { "Line Chart Not Found" } },
                    }
                );
            }

            var grouped = statisticsLine
            .GroupBy(ca => new { ca.CreatedAt.Month, ca.ServiceRequest!.ServiceType })
            .Select(g => new
            {
                g.Key.Month,
                g.Key.ServiceType,
                Count = g.Count()
            })
            .ToList();

            var result = Enumerable.Range(1, 12)
                .Select(m => new AdminLineChartDto
                {
                    Month = m,
                    Year = year,
                    RepairCount = grouped
                        .Where(x => x.Month == m && x.ServiceType == ServiceType.Repair)
                        .Select(x => x.Count)
                        .FirstOrDefault(),
                    ConstructionCount = grouped
                        .Where(x => x.Month == m && x.ServiceType == ServiceType.Construction)
                        .Select(x => x.Count)
                        .FirstOrDefault()
                })
                .ToList();

            return result;
        }

        public async Task<IEnumerable<AdminPieChartDto>> GetPieStatisticsAsync(int year)
        {
            var statisticsPie = await _unitOfWork.ContractorApplicationRepository
                .GetRangeAsync(ca => ca.Status == ApplicationStatus.Approved 
                    && ca.CreatedAt.Year == year, includeProperties:"ServiceRequest");

            if (statisticsPie == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { "Pie Chart Null", new[] { "Pie Chart Not Found" } },
                    }
                );
            }
            var resultGrouped = statisticsPie
                .GroupBy(ca => ca.ServiceRequest!.ServiceType)
                .Select(g => new AdminPieChartDto
                {
                    ServiceType = g.Key,
                    Count = g.Count()
                })
                .ToList();

            return resultGrouped;
        }

        public async Task<AdminTopStatisticsDto> GetTopStatisticsAsync()
        {
            var result = new AdminTopStatisticsDto();

            // === Contractors ===
            var topContractors = await _unitOfWork.ContractorApplicationRepository
                .GetRangeAsync(c => c.Status == ApplicationStatus.Approved);

            var contractorGroups = topContractors
                .GroupBy(tc => tc.ContractorID)
                .Select(g => new
                {
                    ContractorID = g.Key,
                    ApprovedCount = g.Count(),
                    TotalRevenue = g.Sum(x => x.EstimatePrice)
                })
                .OrderByDescending(x => x.ApprovedCount)
                .ThenByDescending(x => x.TotalRevenue)
                .Take(5)
                .ToList();

            var contractorIds = contractorGroups.Select(x => x.ContractorID.ToString()).ToList();
            var contractorUsers = await _userManager.Users
                .Where(u => contractorIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Email);

            result.TopContractors = contractorGroups.Select(p =>
            {
                var email = contractorUsers.TryGetValue(p.ContractorID.ToString(), out var e)
                    ? e : "Unknown";

                return new AdminTopContractorDto
                {
                    ContractorID = p.ContractorID,
                    Email = email!,
                    ApprovedCount = p.ApprovedCount,
                    TotalRevenue = p.TotalRevenue
                };
            }).ToList();


            // === Distributors ===
            var topDistributors = await _unitOfWork.DistributorApplicationRepository
                .GetRangeAsync(app => app.Status == ApplicationStatus.Approved, includeProperties: "Items");

            var distributorGroups = topDistributors
                .GroupBy(app => app.DistributorID)
                .Select(g => new
                {
                    DistributorID = g.Key,
                    ApprovedCount = g.Count(),
                    TotalRevenue = g.Sum(a => a.Items != null ? a.Items.Sum(i => i.Price * i.Quantity) : 0)
                })
                .OrderByDescending(x => x.ApprovedCount)
                .ThenByDescending(x => x.TotalRevenue)
                .Take(5)
                .ToList();

            var distributorIds = distributorGroups.Select(x => x.DistributorID.ToString()).ToList();
            var distributorUsers = await _userManager.Users
                .Where(u => distributorIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Email);

            result.TopDistributors = distributorGroups.Select(g =>
            {
                var email = distributorUsers.TryGetValue(g.DistributorID.ToString(), out var e)
                    ? e : "Unknown";

                return new AdminTopDistributorDto
                {
                    DistributorID = g.DistributorID,
                    Email = email!,
                    ApprovedCount = g.ApprovedCount,
                    TotalRevenue = g.TotalRevenue
                };
            }).ToList();

            return result;
        }
    }
}
