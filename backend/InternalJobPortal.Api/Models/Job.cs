using System;

namespace InternalJobPortal.Api.Models
{
    public class Job
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Department { get; set; }
        public string Location { get; set; }
        public string WorkType { get; set; }
        public string Description { get; set; }
        public string Status { get; set; } // "Open" or "Closed"
        public DateTime CreatedAt { get; set; }
        public int ApplicationCount { get; set; } // joined count
    }

    public class CreateJobRequest
    {
        public string Title { get; set; }
        public string Department { get; set; }
        public string Location { get; set; }
        public string WorkType { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
    }
}
