using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using InternalJobPortal.Api.Data;
using InternalJobPortal.Api.Models;

namespace InternalJobPortal.Api.Controllers
{
    [RoutePrefix("api/auth")]
    public class AuthController : ApiController
    {
        private readonly Db _db = new Db();

        // POST api/auth/register
        [HttpPost, Route("register")]
        public IHttpActionResult Register([FromBody] RegisterRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password)
                || string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.EmployeeId)
                || string.IsNullOrWhiteSpace(req.Department))
                return BadRequest("All fields are required.");

            if (_db.EmailExists(req.Email))
                return Conflict();  // 409

            if (_db.EmployeeIdExists(req.EmployeeId))
                return Content(HttpStatusCode.Conflict, new { message = "Employee ID already registered." });

            try
            {
                var user = _db.RegisterUser(req);
                var token = _db.CreateSession(user.Id);
                return Ok(new AuthResponse { Token = token, User = user });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST api/auth/login
        [HttpPost, Route("login")]
        public IHttpActionResult Login([FromBody] LoginRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest("Email and password are required.");

            if (!_db.CheckPassword(req.Email, req.Password))
                return Content(HttpStatusCode.Unauthorized, new { message = "Invalid email or password." });

            try
            {
                var user = _db.GetUserByEmail(req.Email);
                var token = _db.CreateSession(user.Id);
                return Ok(new AuthResponse { Token = token, User = user });
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // POST api/auth/logout
        [HttpPost, Route("logout")]
        public IHttpActionResult Logout()
        {
            var token = GetToken();
            if (!string.IsNullOrEmpty(token))
                _db.DeleteSession(token);
            return Ok(new { message = "Logged out." });
        }

        // GET api/auth/me
        [HttpGet, Route("me")]
        public IHttpActionResult Me()
        {
            var user = GetCurrentUser();
            if (user == null) return Unauthorized();
            return Ok(user);
        }

        // GET api/auth/seed-admin  (one-time setup call)
        [HttpGet, Route("seed-admin")]
        public IHttpActionResult SeedAdmin()
        {
            _db.SeedAdmin();
            return Ok(new { message = "Admin seeded. Email: admin@company.com | Password: Admin@123" });
        }

        // ── Helpers ──────────────────────────────────────────

        protected string GetToken()
        {
            var auth = Request.Headers.Authorization;
            if (auth != null && auth.Scheme == "Bearer")
                return auth.Parameter;
            return null;
        }

        protected Models.User GetCurrentUser()
        {
            var token = GetToken();
            if (string.IsNullOrEmpty(token)) return null;
            return _db.GetUserByToken(token);
        }
    }
}
