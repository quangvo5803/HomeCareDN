using AutoMapper;
using BusinessLogic.DTOs.Application.Statistic;
using BusinessLogic.DTOs.Application.Statistic.AdminStatistic;
using BusinessLogic.DTOs.Application.Statistic.ContractorStatistic;
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
        private const string SERVICE_REQUEST_INCLUDE = "ServiceRequest";

        public StatisticService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
        }

        public async Task<IEnumerable<BarChartDto>> GetBarChartAsync(
            int year,
            string role,
            Guid? contractorId = null
        )
        {
            IEnumerable<ContractorApplication> contractor =
                Enumerable.Empty<ContractorApplication>();
            IEnumerable<DistributorApplication> distributor =
                Enumerable.Empty<DistributorApplication>();

            if (role == "Admin")
            {
                contractor = await _unitOfWork.ContractorApplicationRepository.GetRangeAsync(
                    x => x.Status == ApplicationStatus.Approved && x.CreatedAt.Year == year,
                    includeProperties: SERVICE_REQUEST_INCLUDE
                );

                distributor = await _unitOfWork.DistributorApplicationRepository.GetRangeAsync(
                    x => x.Status == ApplicationStatus.Approved && x.CreatedAt.Year == year,
                    includeProperties: "Items"
                );
            }
            else if (role == "Contractor" && contractorId.HasValue)
            {
                contractor = await _unitOfWork.ContractorApplicationRepository.GetRangeAsync(
                    x =>
                        x.Status == ApplicationStatus.Approved
                        && x.CreatedAt.Year == year
                        && x.ContractorID == contractorId.Value,
                    includeProperties: SERVICE_REQUEST_INCLUDE
                );
            }

            var result = BuildBarChart(
                contractor,
                role == "Admin" ? distributor : null,
                year,
                x => x.CreatedAt,
                x => x.ServiceRequest?.ServiceType,
                x => x.CreatedAt
            );

            return result;
        }

        public async Task<IEnumerable<LineChartDto>> GetLineChartAsync(
            int year,
            string role,
            Guid? contractorId = null
        )
        {
            if (role == "Admin")
            {
                var payments = await _unitOfWork.PaymentTransactionsRepository.GetRangeAsync(p =>
                    p.Status == PaymentStatus.Paid
                    && p.PaidAt.HasValue
                    && p.PaidAt.Value.Year == year
                );

                var result = BuildLineChart(payments, year, p => p.PaidAt!.Value, p => p.Amount);

                return result;
            }
            else if (role == "Contractor" && contractorId.HasValue)
            {
                var contractorApps =
                    await _unitOfWork.ContractorApplicationRepository.GetRangeAsync(
                        x =>
                            x.Status == ApplicationStatus.Approved
                            && x.CreatedAt.Year == year
                            && x.ContractorID == contractorId.Value,
                        includeProperties: SERVICE_REQUEST_INCLUDE
                    );

                var result = BuildLineChart(
                    contractorApps,
                    year,
                    x => x.CreatedAt,
                    x => (decimal)x.EstimatePrice
                );

                return result;
            }

            return Enumerable.Empty<LineChartDto>();
        }

        public async Task<IEnumerable<AdminPieChartDto>> GetPieChartStatisticsAsync(int year)
        {
            var contractor = await _unitOfWork.ContractorApplicationRepository.GetRangeAsync(
                ca => ca.Status == ApplicationStatus.Approved && ca.CreatedAt.Year == year,
                includeProperties: SERVICE_REQUEST_INCLUDE
            );

            var distributor = await _unitOfWork.DistributorApplicationRepository.GetRangeAsync(
                da => da.Status == ApplicationStatus.Approved && da.CreatedAt.Year == year,
                includeProperties: "Items"
            );

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
                .Select(g => new AdminPieChartDto { Label = g.Key.ToString(), Count = g.Count() })
                .ToList();

            // === Material ===
            var materialCount = distributor.Count();
            resultGrouped.Add(new AdminPieChartDto { Label = "Material", Count = materialCount });

            return resultGrouped;
        }

        public async Task<AdminTopDto> GetAdminTopAsync()
        {
            var result = new AdminTopDto();

            // === Contractors ===
            var topContractors = await _unitOfWork.ContractorApplicationRepository.GetRangeAsync(
                c => c.Status == ApplicationStatus.Approved
            );

            var contractorGroups = topContractors
                .GroupBy(tc => tc.ContractorID)
                .Select(g => new
                {
                    ContractorID = g.Key,
                    ApprovedCount = g.Count(),
                    TotalRevenue = g.Sum(x => x.EstimatePrice),
                })
                .OrderByDescending(x => x.ApprovedCount)
                .ThenByDescending(x => x.TotalRevenue)
                .Take(5)
                .ToList();

            var contractorIds = contractorGroups.Select(x => x.ContractorID.ToString()).ToList();
            var contractorUsers = await _userManager
                .Users.Where(u => contractorIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Email);

            result.TopContractors = contractorGroups
                .Select(p =>
                {
                    var email = contractorUsers.TryGetValue(p.ContractorID.ToString(), out var e)
                        ? e
                        : "Unknown";

                    return new AdminTopPartnerDto
                    {
                        ContractorID = p.ContractorID,
                        ContractorEmail = email!,
                        ContractorApprovedCount = p.ApprovedCount,
                        ContractorTotalRevenue = p.TotalRevenue,
                    };
                })
                .ToList();

            // === Distributors ===
            var topDistributors = await _unitOfWork.DistributorApplicationRepository.GetRangeAsync(
                app => app.Status == ApplicationStatus.Approved,
                includeProperties: "Items"
            );

            var distributorGroups = topDistributors
                .GroupBy(app => app.DistributorID)
                .Select(g => new
                {
                    DistributorID = g.Key,
                    ApprovedCount = g.Count(),
                    TotalRevenue = g.Sum(a =>
                        a.Items != null ? a.Items.Sum(i => i.Price * i.Quantity) : 0
                    ),
                })
                .OrderByDescending(x => x.ApprovedCount)
                .ThenByDescending(x => x.TotalRevenue)
                .Take(5)
                .ToList();

            var distributorIds = distributorGroups.Select(x => x.DistributorID.ToString()).ToList();
            var distributorUsers = await _userManager
                .Users.Where(u => distributorIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id, u => u.Email);

            result.TopDistributors = distributorGroups
                .Select(g =>
                {
                    var email = distributorUsers.TryGetValue(g.DistributorID.ToString(), out var e)
                        ? e
                        : "Unknown";

                    return new AdminTopPartnerDto
                    {
                        DistributorID = g.DistributorID,
                        DistributorEmail = email!,
                        DistributorApprovedCount = g.ApprovedCount,
                        DistributorTotalRevenue = g.TotalRevenue,
                    };
                })
                .ToList();

            return result;
        }

        public async Task<AdminStatDto> GetAdminStatAsync()
        {
            var dto = new AdminStatDto();

            var customers = await _userManager.GetUsersInRoleAsync("Customer");
            var contractors = await _userManager.GetUsersInRoleAsync("Contractor");
            var distributors = await _userManager.GetUsersInRoleAsync("Distributor");

            dto.TotalCustomer = customers.Count;
            dto.TotalContactor = contractors.Count;
            dto.TotalDistributor = distributors.Count;

            var contractorQuery = _unitOfWork
                .ContractorApplicationRepository.GetQueryable()
                .AsSingleQuery()
                .AsNoTracking();
            var distributorQuery = _unitOfWork
                .DistributorApplicationRepository.GetQueryable()
                .AsSingleQuery()
                .AsNoTracking();
            var servicereRequestQuery = _unitOfWork
                .ServiceRequestRepository.GetQueryable()
                .AsSingleQuery()
                .AsNoTracking();
            var materialRequestQuery = _unitOfWork
                .MaterialRequestRepository.GetQueryable()
                .AsSingleQuery()
                .AsNoTracking();

            dto.TotalOpening =
                await servicereRequestQuery.CountAsync(x => x.Status == RequestStatus.Opening)
                + await materialRequestQuery.CountAsync(x => x.Status == RequestStatus.Opening);

            dto.TotalPendingCommission =
                await contractorQuery.CountAsync(x =>
                    x.Status == ApplicationStatus.PendingCommission
                )
                + await distributorQuery.CountAsync(x =>
                    x.Status == ApplicationStatus.PendingCommission
                );

            dto.TotalApproved =
                await contractorQuery.CountAsync(x => x.Status == ApplicationStatus.Approved)
                + await distributorQuery.CountAsync(x => x.Status == ApplicationStatus.Approved);

            var commissionQuery = _unitOfWork.PaymentTransactionsRepository.GetQueryable();
            dto.TotalCommission = await commissionQuery
                .Where(x => x.Status == PaymentStatus.Paid)
                .SumAsync(x => x.Amount);

            return dto;
        }

        //================= Contractor =================

        public async Task<ContractorStatDto> GetContractorStatAsync(Guid contractorID)
        {
            var openRequests = await _unitOfWork
                .ServiceRequestRepository.GetQueryable()
                .AsNoTracking()
                .CountAsync(sr =>
                    sr.Status != RequestStatus.Closed && sr.SelectedContractorApplicationID == null
                );

            var statusCounts = await _unitOfWork
                .ContractorApplicationRepository.GetQueryable()
                .AsNoTracking()
                .Where(ca => ca.ContractorID == contractorID)
                .GroupBy(ca => ca.Status)
                .Select(g => new { g.Key, Count = g.Count() })
                .ToListAsync();

            var dict = statusCounts.ToDictionary(x => x.Key, x => x.Count);

            return new ContractorStatDto
            {
                OpenRequests = openRequests,
                Applied = dict.TryGetValue(ApplicationStatus.Pending, out var pending)
                    ? pending
                    : 0,
                PendingPayments = dict.TryGetValue(
                    ApplicationStatus.PendingCommission,
                    out var pendingCom
                )
                    ? pendingCom
                    : 0,
                Won = dict.TryGetValue(ApplicationStatus.Approved, out var approved) ? approved : 0,
            };
        }

        //================= Build Chart =================
        private static IEnumerable<BarChartDto> BuildBarChart<TContractor, TDistributor>(
            IEnumerable<TContractor> contractor,
            IEnumerable<TDistributor>? distributor,
            int year,
            Func<TContractor, DateTime> contractorCreatedAtSelector,
            Func<TContractor, ServiceType?> contractorServiceTypeSelector,
            Func<TDistributor, DateTime>? distributorCreatedAtSelector = null
        )
        {
            var groupedContractor = contractor
                .GroupBy(c => new
                {
                    Month = contractorCreatedAtSelector(c).Month,
                    ServiceType = contractorServiceTypeSelector(c),
                })
                .Select(g => new
                {
                    g.Key.Month,
                    g.Key.ServiceType,
                    Count = g.Count(),
                })
                .ToList();

            var groupedDistributor =
                distributor != null
                    ? distributor
                        .GroupBy(d => distributorCreatedAtSelector!(d).Month)
                        .Select(g => new { Month = g.Key, Count = g.Count() })
                        .ToList()
                    : new List<(int Month, int Count)>()
                        .Select(x => new { x.Month, x.Count })
                        .ToList();

            return Enumerable
                .Range(1, 12)
                .Select(m => new BarChartDto
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
                        .FirstOrDefault(),
                })
                .ToList();
        }

        private static IEnumerable<LineChartDto> BuildLineChart<T>(
            IEnumerable<T> data,
            int year,
            Func<T, DateTime> dateSelector,
            Func<T, decimal> valueSelector
        )
        {
            var grouped = data.GroupBy(x => dateSelector(x).Month)
                .Select(g => new { Month = g.Key, Total = g.Sum(valueSelector) })
                .ToList();

            return Enumerable
                .Range(1, 12)
                .Select(m => new LineChartDto
                {
                    Month = m,
                    Year = year,
                    TotalValue = grouped
                        .Where(x => x.Month == m)
                        .Select(x => x.Total)
                        .FirstOrDefault(),
                })
                .ToList();
        }
    }
}
