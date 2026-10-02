using System;

namespace InternalJobPortal.Api.Models
{
    public class Application
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public int UserId { get; set; }
        public string CoverNote { get; set; }
        public string Status { get; set; }
        public DateTime AppliedAt { get; set; }

        // Joined fields for display
        public string JobTitle { get; set; }
        public string JobDepartment { get; set; }
        public string JobLocation { get; set; }
        public string ApplicantName { get; set; }
        public string ApplicantEmail { get; set; }
        public string ApplicantEmployeeId { get; set; }
        public string ApplicantDepartment { get; set; }
    }

    public class CreateApplicationRequest
    {
        public int JobId { get; set; }
        public string CoverNote { get; set; }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; }
    }
}
