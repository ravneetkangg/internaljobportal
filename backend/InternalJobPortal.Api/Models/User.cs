using System;

namespace InternalJobPortal.Api.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string EmployeeId { get; set; }
        public string Department { get; set; }
        public string Role { get; set; } // "admin" or "employee"
        public DateTime CreatedAt { get; set; }
    }
}
