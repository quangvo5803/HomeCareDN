﻿namespace DataAccess.Entities.Application
{
    public class DistributorApplication
    {
        public Guid DistributorApplicationID { get; set; }
        public Guid MaterialRequestID { get; set; }
        public Guid DistributorID { get; set; }
        public string? Message { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    }
}
