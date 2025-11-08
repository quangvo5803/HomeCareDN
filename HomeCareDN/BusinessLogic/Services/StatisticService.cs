using AutoMapper;
using BusinessLogic.DTOs.Application.Statistic;
using BusinessLogic.DTOs.Application.Statistic.AdminStatistic;
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

        public async Task<IEnumerable<AdminBarChartDto>> GetBarChartStatisticsAsync(int year)
        {
            var contractor = await _unitOfWork.ContractorApplicationRepository
                .GetRangeAsync(sta => sta.Status == ApplicationStatus.Approved && 
                    sta.CreatedAt.Year == year, includeProperties:"ServiceRequest"
                );

            var distributor = await _unitOfWork.DistributorApplicationRepository
                .GetRangeAsync(sta => sta.Status == ApplicationStatus.Approved && 
                    sta.CreatedAt.Year == year, includeProperties:"Items"
                );

            if (contractor == null || distributor == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { "Bar Chart Null", new[] { "Bar Chart Not Found" } },
                    }
                );
            }

            var groupedContractor = contractor
            .GroupBy(ca => new { ca.CreatedAt.Month, ca.ServiceRequest!.ServiceType })
            .Select(g => new
            {
                g.Key.Month,
                g.Key.ServiceType,
                Count = g.Count()
            })
            .ToList();

            var groupedDistributor = distributor
            .GroupBy(d => d.CreatedAt.Month)
            .Select(g => new
            {
                Month = g.Key,
                Count = g.Count()
            })
            .ToList();

            var result = Enumerable.Range(1, 12)
                .Select(m => new AdminBarChartDto
                {
                    Month = m,
                    Year = year,
                    RepairCount = groupedContractor
                        .Where(x => x.Month == m && x.ServiceType == ServiceType.Repair)
                        .Select(x => x.Count)
                        .FirstOrDefault(),
                    ConstructionCount = groupedContractor
                        .Where(x => x.Month == m && x.ServiceType == ServiceType.Construction)
                        .Select(x => x.Count)
                        .FirstOrDefault(),
                    MaterialCount = groupedDistributor
                        .Where(x => x.Month == m)
                        .Select(x => x.Count)
                        .FirstOrDefault()
                })
                .ToList();

            return result;
        }

        public async Task<IEnumerable<AdminPieChartDto>> GetPieChartStatisticsAsync(int year)
        {
             var contractor = await _unitOfWork.ContractorApplicationRepository
                .GetRangeAsync(ca => ca.Status == ApplicationStatus.Approved
                    && ca.CreatedAt.Year == year, includeProperties: "ServiceRequest");

            var distributor = await _unitOfWork.DistributorApplicationRepository
                .GetRangeAsync(da => da.Status == ApplicationStatus.Approved
                    && da.CreatedAt.Year == year, includeProperties: "Items");

            if (contractor == null || distributor == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { "Pie Chart Null", new[] { "Pie Chart Not Found" } },
                    }
                );
            }

            // === Repair & Construction ===
            var resultGrouped = contractor
                .GroupBy(ca => ca.ServiceRequest!.ServiceType)
                .Select(g => new AdminPieChartDto
                {
                    Label = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToList();

            // === Material ===
            var materialCount = distributor.Count();
            resultGrouped.Add(new AdminPieChartDto
            {
                Label = "Material",
                Count = materialCount
            });

            return resultGrouped;
        }

        public async Task<IEnumerable<AdminLineChartDto>> GetLineChartStatisticsAsync(int year)
        {
            var payments = await _unitOfWork.PaymentTransactionsRepository
                .GetRangeAsync(p => p.Status == PaymentStatus.Paid 
                    && p.PaidAt.HasValue 
                    && p.PaidAt.Value.Year == year
                );

            if (payments == null)
            {
                throw new CustomValidationException(
                    new Dictionary<string, string[]>
                    {
                        { "Line Chart Null", new[] { "Line Chart Not Found" } },
                    }
                );
            }
            var groupedPayments = payments
                .GroupBy(p => p.PaidAt!.Value.Month)
                .Select(g => new
                {
                    Month = g.Key,
                    TotalAmount = g.Sum(x => x.Amount),
                })
                .ToList();
            var result = Enumerable.Range(1, 12)
                .Select(m => new AdminLineChartDto
                {
                    Month = m,
                    Year = year,
                    TotalCommission = groupedPayments
                        .Where(x => x.Month == m)
                        .Select(x => x.TotalAmount)
                        .FirstOrDefault()
                })
                .ToList();
            return result;
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

                return new AdminTopPartnerDto
                {
                    ContractorID = p.ContractorID,
                    ContractorEmail = email!,
                    ContractorApprovedCount = p.ApprovedCount,
                    ContractorTotalRevenue = p.TotalRevenue
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

                return new AdminTopPartnerDto
                {
                    DistributorID = g.DistributorID,
                    DistributorEmail = email!,
                    DistributorApprovedCount = g.ApprovedCount,
                    DistributorTotalRevenue = g.TotalRevenue
                };
            }).ToList();

            return result;
        }

        public async Task<AdminStatStatisticDto> GetStatStatisticAsync()
        {
            var dto = new AdminStatStatisticDto();

            var customers = await _userManager.GetUsersInRoleAsync("Customer");
            var contractors = await _userManager.GetUsersInRoleAsync("Contractor");
            var distributors = await _userManager.GetUsersInRoleAsync("Distributor");

            dto.TotalCustomer = customers.Count;
            dto.TotalContactor = contractors.Count;
            dto.TotalDistributor = distributors.Count;

            var contractorQuery = _unitOfWork.ContractorApplicationRepository
                .GetQueryable().AsSingleQuery().AsNoTracking();
            var distributorQuery = _unitOfWork.DistributorApplicationRepository
                .GetQueryable().AsSingleQuery().AsNoTracking();

            dto.TotalPending =
                await contractorQuery.CountAsync(x => x.Status == ApplicationStatus.Pending) +
                await distributorQuery.CountAsync(x => x.Status == ApplicationStatus.Pending);

            dto.TotalPendingCommission =
                await contractorQuery.CountAsync(x => x.Status == ApplicationStatus.PendingCommission) +
                await distributorQuery.CountAsync(x => x.Status == ApplicationStatus.PendingCommission);

            var commissionQuery = _unitOfWork.PaymentTransactionsRepository.GetQueryable();
            dto.TotalCommission = await commissionQuery
                .Where(x => x.Status == PaymentStatus.Paid)
                .SumAsync(x => x.Amount);

            return dto;
        }

    }
}
