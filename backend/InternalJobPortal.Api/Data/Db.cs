using System;
using System.Collections.Generic;
using System.Configuration;
using InternalJobPortal.Api.Helpers;
using InternalJobPortal.Api.Models;
using MySql.Data.MySqlClient;

namespace InternalJobPortal.Api.Data
{
    public class Db
    {
        private readonly string _conn;

        public Db()
        {
            _conn = ConfigurationManager.ConnectionStrings["JobPortalDb"].ConnectionString;
        }

        private MySqlConnection Open()
        {
            var c = new MySqlConnection(_conn);
            c.Open();
            return c;
        }

        // ─── AUTH ─────────────────────────────────────────────

        public User GetUserByEmail(string email)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                "SELECT id, name, email, employee_id, department, role, created_at FROM users WHERE email = @e", c))
            {
                cmd.Parameters.AddWithValue("@e", email);
                using (var r = cmd.ExecuteReader())
                    return r.Read() ? MapUser(r) : null;
            }
        }

        public User GetUserById(int id)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                "SELECT id, name, email, employee_id, department, role, created_at FROM users WHERE id = @id", c))
            {
                cmd.Parameters.AddWithValue("@id", id);
                using (var r = cmd.ExecuteReader())
                    return r.Read() ? MapUser(r) : null;
            }
        }

        public bool CheckPassword(string email, string password)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand("SELECT password_hash FROM users WHERE email = @e", c))
            {
                cmd.Parameters.AddWithValue("@e", email);
                var hash = cmd.ExecuteScalar() as string;
                return hash != null && PasswordHelper.Verify(password, hash);
            }
        }

        public User RegisterUser(RegisterRequest req)
        {
            var hash = PasswordHelper.HashPassword(req.Password);
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                @"INSERT INTO users (name, email, password_hash, employee_id, department, role)
                  VALUES (@name, @email, @hash, @empid, @dept, 'employee');
                  SELECT LAST_INSERT_ID();", c))
            {
                cmd.Parameters.AddWithValue("@name", req.Name);
                cmd.Parameters.AddWithValue("@email", req.Email);
                cmd.Parameters.AddWithValue("@hash", hash);
                cmd.Parameters.AddWithValue("@empid", req.EmployeeId);
                cmd.Parameters.AddWithValue("@dept", req.Department);
                int newId = Convert.ToInt32(cmd.ExecuteScalar());
                return GetUserById(newId);
            }
        }

        public bool EmailExists(string email)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand("SELECT COUNT(*) FROM users WHERE email = @e", c))
            {
                cmd.Parameters.AddWithValue("@e", email);
                return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
            }
        }

        public bool EmployeeIdExists(string empId)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand("SELECT COUNT(*) FROM users WHERE employee_id = @e", c))
            {
                cmd.Parameters.AddWithValue("@e", empId);
                return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
            }
        }

        // ─── SESSIONS ─────────────────────────────────────────

        public string CreateSession(int userId)
        {
            var token = Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N"); // 64-char token
            var expires = DateTime.UtcNow.AddHours(8);
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                "INSERT INTO user_sessions (user_id, token, expires_at) VALUES (@uid, @tok, @exp)", c))
            {
                cmd.Parameters.AddWithValue("@uid", userId);
                cmd.Parameters.AddWithValue("@tok", token);
                cmd.Parameters.AddWithValue("@exp", expires);
                cmd.ExecuteNonQuery();
            }
            return token;
        }

        public User GetUserByToken(string token)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                @"SELECT u.id, u.name, u.email, u.employee_id, u.department, u.role, u.created_at
                  FROM user_sessions s
                  INNER JOIN users u ON s.user_id = u.id
                  WHERE s.token = @tok AND s.expires_at > UTC_TIMESTAMP()", c))
            {
                cmd.Parameters.AddWithValue("@tok", token);
                using (var r = cmd.ExecuteReader())
                    return r.Read() ? MapUser(r) : null;
            }
        }

        public void DeleteSession(string token)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand("DELETE FROM user_sessions WHERE token = @tok", c))
            {
                cmd.Parameters.AddWithValue("@tok", token);
                cmd.ExecuteNonQuery();
            }
        }

        // ─── ADMIN SEED ───────────────────────────────────────

        public void SeedAdmin()
        {
            // Creates admin if not already present
            if (!EmailExists("admin@company.com"))
            {
                var hash = PasswordHelper.HashPassword("Admin@123");
                using (var c = Open())
                using (var cmd = new MySqlCommand(
                    @"INSERT INTO users (name, email, password_hash, employee_id, department, role)
                      VALUES ('Admin', 'admin@company.com', @hash, 'EMP-0001', 'Administration', 'admin')", c))
                {
                    cmd.Parameters.AddWithValue("@hash", hash);
                    cmd.ExecuteNonQuery();
                }
            }
        }

        // ─── JOBS ─────────────────────────────────────────────

        public List<Job> GetJobs(string statusFilter = null)
        {
            var list = new List<Job>();
            var sql = @"SELECT j.id, j.title, j.department, j.location, j.work_type, j.description, j.status, j.created_at,
                               (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS app_count
                        FROM jobs j";
            if (!string.IsNullOrEmpty(statusFilter) && statusFilter != "All")
                sql += " WHERE j.status = @s";
            sql += " ORDER BY j.created_at DESC";

            using (var c = Open())
            using (var cmd = new MySqlCommand(sql, c))
            {
                if (!string.IsNullOrEmpty(statusFilter) && statusFilter != "All")
                    cmd.Parameters.AddWithValue("@s", statusFilter);
                using (var r = cmd.ExecuteReader())
                    while (r.Read()) list.Add(MapJob(r));
            }
            return list;
        }

        public Job GetJobById(int id)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                @"SELECT j.id, j.title, j.department, j.location, j.work_type, j.description, j.status, j.created_at,
                         (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS app_count
                  FROM jobs j WHERE j.id = @id", c))
            {
                cmd.Parameters.AddWithValue("@id", id);
                using (var r = cmd.ExecuteReader())
                    return r.Read() ? MapJob(r) : null;
            }
        }

        public Job CreateJob(CreateJobRequest req)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                @"INSERT INTO jobs (title, department, location, work_type, description, status)
                  VALUES (@t, @d, @l, @wt, @desc, @s);
                  SELECT LAST_INSERT_ID();", c))
            {
                cmd.Parameters.AddWithValue("@t", req.Title);
                cmd.Parameters.AddWithValue("@d", req.Department);
                cmd.Parameters.AddWithValue("@l", req.Location);
                cmd.Parameters.AddWithValue("@wt", req.WorkType ?? "Hybrid");
                cmd.Parameters.AddWithValue("@desc", req.Description);
                cmd.Parameters.AddWithValue("@s", req.Status ?? "Open");
                int id = Convert.ToInt32(cmd.ExecuteScalar());
                return GetJobById(id);
            }
        }

        public bool UpdateJob(int id, CreateJobRequest req)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                @"UPDATE jobs SET title=@t, department=@d, location=@l, work_type=@wt,
                  description=@desc, status=@s WHERE id=@id", c))
            {
                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@t", req.Title);
                cmd.Parameters.AddWithValue("@d", req.Department);
                cmd.Parameters.AddWithValue("@l", req.Location);
                cmd.Parameters.AddWithValue("@wt", req.WorkType ?? "Hybrid");
                cmd.Parameters.AddWithValue("@desc", req.Description);
                cmd.Parameters.AddWithValue("@s", req.Status ?? "Open");
                return cmd.ExecuteNonQuery() > 0;
            }
        }

        public bool DeleteJob(int id)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand("DELETE FROM jobs WHERE id = @id", c))
            {
                cmd.Parameters.AddWithValue("@id", id);
                return cmd.ExecuteNonQuery() > 0;
            }
        }

        // ─── APPLICATIONS ─────────────────────────────────────

        public bool HasApplied(int userId, int jobId)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                "SELECT COUNT(*) FROM applications WHERE user_id = @u AND job_id = @j", c))
            {
                cmd.Parameters.AddWithValue("@u", userId);
                cmd.Parameters.AddWithValue("@j", jobId);
                return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
            }
        }

        public Application CreateApplication(int userId, CreateApplicationRequest req)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                @"INSERT INTO applications (job_id, user_id, cover_note, status)
                  VALUES (@jid, @uid, @note, 'Submitted');
                  SELECT LAST_INSERT_ID();", c))
            {
                cmd.Parameters.AddWithValue("@jid", req.JobId);
                cmd.Parameters.AddWithValue("@uid", userId);
                cmd.Parameters.AddWithValue("@note", req.CoverNote ?? string.Empty);
                int id = Convert.ToInt32(cmd.ExecuteScalar());
                return GetApplicationById(id);
            }
        }

        public Application GetApplicationById(int id)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                @"SELECT a.id, a.job_id, a.user_id, a.cover_note, a.status, a.applied_at,
                         j.title, j.department, j.location,
                         u.name, u.email, u.employee_id, u.department AS u_dept
                  FROM applications a
                  JOIN jobs j ON a.job_id = j.id
                  JOIN users u ON a.user_id = u.id
                  WHERE a.id = @id", c))
            {
                cmd.Parameters.AddWithValue("@id", id);
                using (var r = cmd.ExecuteReader())
                    return r.Read() ? MapApplication(r) : null;
            }
        }

        public List<Application> GetMyApplications(int userId)
        {
            var list = new List<Application>();
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                @"SELECT a.id, a.job_id, a.user_id, a.cover_note, a.status, a.applied_at,
                         j.title, j.department, j.location,
                         u.name, u.email, u.employee_id, u.department AS u_dept
                  FROM applications a
                  JOIN jobs j ON a.job_id = j.id
                  JOIN users u ON a.user_id = u.id
                  WHERE a.user_id = @uid
                  ORDER BY a.applied_at DESC", c))
            {
                cmd.Parameters.AddWithValue("@uid", userId);
                using (var r = cmd.ExecuteReader())
                    while (r.Read()) list.Add(MapApplication(r));
            }
            return list;
        }

        public List<Application> GetAllApplications()
        {
            var list = new List<Application>();
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                @"SELECT a.id, a.job_id, a.user_id, a.cover_note, a.status, a.applied_at,
                         j.title, j.department, j.location,
                         u.name, u.email, u.employee_id, u.department AS u_dept
                  FROM applications a
                  JOIN jobs j ON a.job_id = j.id
                  JOIN users u ON a.user_id = u.id
                  ORDER BY a.applied_at DESC", c))
            {
                using (var r = cmd.ExecuteReader())
                    while (r.Read()) list.Add(MapApplication(r));
            }
            return list;
        }

        public List<Application> GetApplicationsForJob(int jobId)
        {
            var list = new List<Application>();
            using (var c = Open())
            using (var cmd = new MySqlCommand(
                @"SELECT a.id, a.job_id, a.user_id, a.cover_note, a.status, a.applied_at,
                         j.title, j.department, j.location,
                         u.name, u.email, u.employee_id, u.department AS u_dept
                  FROM applications a
                  JOIN jobs j ON a.job_id = j.id
                  JOIN users u ON a.user_id = u.id
                  WHERE a.job_id = @jid
                  ORDER BY a.applied_at DESC", c))
            {
                cmd.Parameters.AddWithValue("@jid", jobId);
                using (var r = cmd.ExecuteReader())
                    while (r.Read()) list.Add(MapApplication(r));
            }
            return list;
        }

        public bool UpdateApplicationStatus(int id, string status)
        {
            using (var c = Open())
            using (var cmd = new MySqlCommand("UPDATE applications SET status = @s WHERE id = @id", c))
            {
                cmd.Parameters.AddWithValue("@s", status);
                cmd.Parameters.AddWithValue("@id", id);
                return cmd.ExecuteNonQuery() > 0;
            }
        }

        // ─── MAPPERS ──────────────────────────────────────────

        private User MapUser(MySqlDataReader r) => new User
        {
            Id = r.GetInt32("id"),
            Name = r.GetString("name"),
            Email = r.GetString("email"),
            EmployeeId = r.GetString("employee_id"),
            Department = r.GetString("department"),
            Role = r.GetString("role"),
            CreatedAt = r.GetDateTime("created_at")
        };

        private Job MapJob(MySqlDataReader r) => new Job
        {
            Id = r.GetInt32("id"),
            Title = r.GetString("title"),
            Department = r.GetString("department"),
            Location = r.GetString("location"),
            WorkType = r.GetString("work_type"),
            Description = r.GetString("description"),
            Status = r.GetString("status"),
            CreatedAt = r.GetDateTime("created_at"),
            ApplicationCount = Convert.ToInt32(r["app_count"])
        };

        private Application MapApplication(MySqlDataReader r) => new Application
        {
            Id = r.GetInt32("id"),
            JobId = r.GetInt32("job_id"),
            UserId = r.GetInt32("user_id"),
            CoverNote = r.IsDBNull(r.GetOrdinal("cover_note")) ? null : r.GetString("cover_note"),
            Status = r.GetString("status"),
            AppliedAt = r.GetDateTime("applied_at"),
            JobTitle = r.GetString("title"),
            JobDepartment = r.GetString("department"),
            JobLocation = r.GetString("location"),
            ApplicantName = r.GetString("name"),
            ApplicantEmail = r.GetString("email"),
            ApplicantEmployeeId = r.GetString("employee_id"),
            ApplicantDepartment = r.GetString("u_dept")
        };
    }
}
