using System;
using System.Net;
using System.Web.Http;
using InternalJobPortal.Api.Data;
using InternalJobPortal.Api.Models;

namespace InternalJobPortal.Api.Controllers
{
    [RoutePrefix("api/applications")]
    public class ApplicationsController : ApiController
    {
        private readonly Db _db = new Db();

        private Models.User GetCurrentUser()
        {
            var auth = Request.Headers.Authorization;
            if (auth == null || auth.Scheme != "Bearer") return null;
            return _db.GetUserByToken(auth.Parameter);
        }

        // POST api/applications  — employee submits an application
        [HttpPost, Route("")]
        public IHttpActionResult Apply([FromBody] CreateApplicationRequest req)
        {
            var user = GetCurrentUser();
            if (user == null) return Unauthorized();
            if (user.Role == "admin") return Content(HttpStatusCode.Forbidden, new { message = "Admins cannot apply for jobs." });

            if (req == null || req.JobId <= 0) return BadRequest("Valid JobId is required.");

            // Check job exists and is open
            var job = _db.GetJobById(req.JobId);
            if (job == null) return NotFound();
            if (job.Status != "Open") return Content(HttpStatusCode.BadRequest, new { message = "This position is no longer open." });

            // Prevent duplicate application
            if (_db.HasApplied(user.Id, req.JobId))
                return Content(HttpStatusCode.Conflict, new { message = "You have already applied for this position." });

            try
            {
                var app = _db.CreateApplication(user.Id, req);
                return Created(new Uri(Request.RequestUri + "/" + app.Id), app);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        // GET api/applications/my  — employee's own applications
        [HttpGet, Route("my")]
        public IHttpActionResult GetMine()
        {
            var user = GetCurrentUser();
            if (user == null) return Unauthorized();
            if (user.Role == "admin") return Content(HttpStatusCode.Forbidden, new { message = "Use /api/applications for admin view." });

            return Ok(_db.GetMyApplications(user.Id));
        }

        // GET api/applications  — admin: all applications
        [HttpGet, Route("")]
        public IHttpActionResult GetAll([FromUri] int? jobId = null)
        {
            var user = GetCurrentUser();
            if (user == null) return Unauthorized();
            if (user.Role != "admin") return Content(HttpStatusCode.Forbidden, new { message = "Admins only." });

            if (jobId.HasValue)
                return Ok(_db.GetApplicationsForJob(jobId.Value));

            return Ok(_db.GetAllApplications());
        }

        // PUT api/applications/{id}/status  — admin updates status
        [HttpPut, Route("{id:int}/status")]
        public IHttpActionResult UpdateStatus(int id, [FromBody] UpdateStatusRequest req)
        {
            var user = GetCurrentUser();
            if (user == null) return Unauthorized();
            if (user.Role != "admin") return Content(HttpStatusCode.Forbidden, new { message = "Admins only." });

            if (req == null || string.IsNullOrWhiteSpace(req.Status))
                return BadRequest("Status is required.");

            bool updated = _db.UpdateApplicationStatus(id, req.Status);
            if (!updated) return NotFound();
            return Ok(new { message = "Status updated.", status = req.Status });
        }
    }
}
