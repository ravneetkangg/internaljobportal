namespace InternalJobPortal.Api.Models
{
    // Used for login request body
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    // Used for register request body
    public class RegisterRequest
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string EmployeeId { get; set; }
        public string Department { get; set; }
    }

    // Returned after successful login
    public class AuthResponse
    {
        public string Token { get; set; }
        public User User { get; set; }
    }
}
